import { BoundSheetData } from "base_classes/base_sheet_data";
import { BOUND_SHEETS, NAMED_RANGES } from "constants";

export class DataSheetData extends BoundSheetData {
  /**
   * dataシートの全データを取得します。
   * ヘッダー行（1行目）はスキップします。
   * @returns {Array<Object>} {month, category, item, quantity} のフリーズされたオブジェクトの配列。
   */
  static get all() {
    const get = () => {
      const sheet = this._getSheet(BOUND_SHEETS.DATA);
      if (!sheet) return [];

      const data = sheet.getDataRange().getValues().slice(1).filter(row => row[0]);
      const namedRangeCols = this._getNamedRangeColsOf(sheet);

      return data.map((row) => {
        return Object.freeze({
          month: row[namedRangeCols[NAMED_RANGES.BOUND_SHEETS.DATA.MONTH] - 1],
          category: row[namedRangeCols[NAMED_RANGES.BOUND_SHEETS.DATA.CATEGORY] - 1],
          item: row[namedRangeCols[NAMED_RANGES.BOUND_SHEETS.DATA.ITEM] - 1],
          quantity: row[namedRangeCols[NAMED_RANGES.BOUND_SHEETS.DATA.QUANTITY] - 1],
        });
      });
    };
    
    this._allCache = this._allCache || get();
    return this._allCache;
  }
}
