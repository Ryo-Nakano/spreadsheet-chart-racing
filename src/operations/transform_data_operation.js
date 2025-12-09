import { BaseOperation } from "base_classes/base_operation";
import { DataSheetData } from "sheet_data/bound_sheet/data_sheet_data";
import { OperationSheetData } from "sheet_data/bound_sheet/operation_sheet_data";

export class TransformDataOperation extends BaseOperation {
  constructor() {
    super();
  }

  _operation() {
    const rawData = this._loadRawData();
    const { aggregationMap, sortedMonths } = this._aggregateData(rawData);
    const outputData = this._generateOutputData(aggregationMap, sortedMonths);
    
    this._writeToOperationSheet(outputData);
    
    SpreadsheetApp.getUi().alert("データの変換が完了しました。");
  }

  /**
   * データを読み込み、存在チェックを行います。
   * @returns {Array<Object>}
   */
  _loadRawData() {
    const rawData = DataSheetData.all;
    if (rawData.length === 0) {
      throw new Error("処理対象のデータが存在しません。");
    }
    return rawData;
  }

  /**
   * データを正規化し、集約します。
   * @param {Array<Object>} rawData 
   * @returns {{aggregationMap: Map, sortedMonths: Array<string>}}
   */
  _aggregateData(rawData) {
    // 集計用マップ
    // Key: item + "_" + category (ユニークキー)
    // Value: { item, category, monthlyQuantities: Map<monthStr, number> }
    const aggregationMap = new Map();
    const allMonths = new Set();

    // データの走査と正規化・集約
    for (const row of rawData) {
      // 1. Month 正規化
      const normalizedMonth = this._normalizeMonth(row.month);
      if (!normalizedMonth) continue; // 日付として不正な場合はスキップ

      // 2. Category / Item 正規化
      const category = row.category ? String(row.category).trim() : "";
      const item = row.item ? String(row.item).trim() : "";
      if (category === "" || item === "") continue; // 空の場合はスキップ

      // 3. Quantity 正規化
      const quantity = Number(row.quantity);
      if (isNaN(quantity) || row.quantity === null || row.quantity === undefined) continue; // 数値でない場合はスキップ

      // 4. 集約
      const key = `${item}_${category}`;
      if (!aggregationMap.has(key)) {
        aggregationMap.set(key, {
          item: item,
          category: category,
          monthlyQuantities: new Map(),
        });
      }

      const entry = aggregationMap.get(key);
      const currentQty = entry.monthlyQuantities.get(normalizedMonth) || 0;
      entry.monthlyQuantities.set(normalizedMonth, currentQty + quantity);

      allMonths.add(normalizedMonth);
    }

    if (aggregationMap.size === 0) {
      throw new Error("有効なデータが存在しませんでした。");
    }

    return {
      aggregationMap,
      sortedMonths: Array.from(allMonths).sort(),
    };
  }

  /**
   * 集約データから出力用の2次元配列（ヘッダーと累積データ）を生成します。
   * @param {Map} aggregationMap 
   * @param {Array<string>} sortedMonths 
   * @returns {Array<Array<any>>}
   */
  _generateOutputData(aggregationMap, sortedMonths) {
    const outputData = [];

    // ヘッダー行
    const header = ["item", "category", ...sortedMonths];
    outputData.push(header);

    // データ行（累積計算）
    for (const [key, entry] of aggregationMap) {
      const row = [entry.item, entry.category];
      let accumulated = 0;

      for (const month of sortedMonths) {
        const monthlyQty = entry.monthlyQuantities.get(month) || 0;
        accumulated += monthlyQty;
        row.push(accumulated);
      }
      outputData.push(row);
    }

    return outputData;
  }

  /**
   * operationシートにデータを書き込みます。
   * @param {Array<Array<any>>} outputData 
   */
  _writeToOperationSheet(outputData) {
    OperationSheetData.clear();
    OperationSheetData.setValues(outputData);
  }

  /**
   * 日付を正規化し、yyyy/MM/dd (01日固定) の文字列を返します。
   * 無効な日付の場合は null を返します。
   * @param {any} rawMonth 
   * @returns {string|null}
   */
  _normalizeMonth(rawMonth) {
    if (!rawMonth) return null;

    let date;
    if (rawMonth instanceof Date) {
      date = new Date(rawMonth);
    } else {
      // 文字列や数値からの変換を試みる
      date = new Date(rawMonth);
    }

    // Dateとして無効かチェック
    if (isNaN(date.getTime())) return null;

    // 1日に丸める
    date.setDate(1);

    // yyyy/MM/dd 形式に変換 (Asia/Tokyo)
    return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd');
  }
}
