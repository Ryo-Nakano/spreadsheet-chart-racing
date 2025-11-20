import { BoundSheetData } from 'base_classes/base_sheet_data';
import { BOUND_SHEETS, NAMED_RANGES } from 'constants';

/**
 * 'config'シートへのデータアクセスを提供するクラス。
 */
export class Config extends BoundSheetData {
  /**
   * キャッシュされた設定データをオブジェクトとして返します。
   * @returns {Object.<string, any>} 設定キーをキー、設定値を値とするオブジェクト。
   */
  static get all() {
    const get = () => {
      const sheet = this._getSheet(BOUND_SHEETS.CONFIG);
      if (!sheet) return {};

      const data = sheet.getDataRange().getValues().filter(row => row[0]); // キーが空でない行をフィルタ
      const namedRangeCols = this._getNamedRangeColsOf(sheet);

      return data.reduce((acc, row) => {
        const key = row[namedRangeCols[NAMED_RANGES.BOUND_SHEETS.CONFIG.KEY] - 1];
        let value = row[namedRangeCols[NAMED_RANGES.BOUND_SHEETS.CONFIG.VALUE] - 1];

        // 日付オブジェクトをISO文字列に変換するロジックを移植
        if (value instanceof Date) {
          value = value.toISOString();
        }
        acc[key] = value;
        return acc;
      }, {});
    };
    this._cache = this._cache || get();
    return this._cache;
  }
}
