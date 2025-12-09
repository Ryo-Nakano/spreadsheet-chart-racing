import { BoundSheetData } from "base_classes/base_sheet_data";
import { BOUND_SHEETS } from "constants";

export class OperationSheetData extends BoundSheetData {
  /**
   * operationシートの全データを取得します。
   * @returns {Array<Array<any>>} データ行の配列。
   */
  static get all() {
    const get = () => {
      const sheet = this._getSheet(BOUND_SHEETS.OPERATION);
      if (!sheet) return [];
      return sheet.getDataRange().getValues();
    };
    this._allCache = this._allCache || get();
    return this._allCache;
  }

  /**
   * operationシートの全データを取得します。
   * Dateオブジェクトは yyyy/MM/dd 形式の文字列に変換されます。
   * @returns {Array<Array<any>>} データ行の配列。
   */
  static get formattedAll() {
    const data = this.all;
    if (!data || data.length === 0) return [];

    return data.map(row => row.map(cell => {
      if (Object.prototype.toString.call(cell) === '[object Date]') {
         return Utilities.formatDate(cell, 'Asia/Tokyo', 'yyyy/MM/dd');
      }
      return cell;
    }));
  }

  /**
   * シートの内容を全てクリアします。
   */
  static clear() {
    const sheet = this._getSheet(BOUND_SHEETS.OPERATION);
    if (sheet) {
        sheet.clear();
        this._allCache = null; // キャッシュクリア
    }
  }

  /**
   * データをシートに書き込みます。
   * @param {Array<Array<any>>} values 書き込むデータの2次元配列。
   */
  static setValues(values) {
    if (!values || values.length === 0) return;

    const sheet = this._getSheet(BOUND_SHEETS.OPERATION);
    if (!sheet) {
        throw new Error(`Sheet not found: ${BOUND_SHEETS.OPERATION}`);
    }

    const rows = values.length;
    const cols = values[0].length;
    
    sheet.getRange(1, 1, rows, cols).setValues(values);
    this._allCache = null; // キャッシュクリア
  }
}
