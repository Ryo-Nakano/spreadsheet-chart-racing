import { BoundSheetData } from 'base_classes/base_sheet_data';
import { BOUND_SHEETS, NAMED_RANGES } from 'constants';

/**
 * 'categories'シートへのデータアクセスを提供するクラス。
 */
export class Categories extends BoundSheetData {
  /**
   * キャッシュされたカテゴリと色の生の対応データを配列として返します。
   * @returns {Array<Object>} {index: number, category: string, color: string} のフリーズされたオブジェクトの配列。
   */
  static get all() {
    const get = () => {
      const data = this._getSheet(BOUND_SHEETS.CATEGORIES).getDataRange().getValues().slice(1).filter(row => row[0]);
      const namedRangeCols = this._getNamedRangeColsOf(this._getSheet(BOUND_SHEETS.CATEGORIES));

      return data.map((row, index) => {
        return Object.freeze({
          index: index,
          category: row[namedRangeCols[NAMED_RANGES.BOUND_SHEETS.CATEGORIES.CATEGORY] - 1].trim(),
          color: row[namedRangeCols[NAMED_RANGES.BOUND_SHEETS.CATEGORIES.COLOR] - 1].trim(),
        });
      });
    };
    this._allCache = this._allCache || get();
    return this._allCache;
  }

  /**
   * カテゴリをキー、カラーコードを値とするオブジェクトを返します。
   * @returns {Object.<string, string>}
   */
  static get colors() {
    const get = () => {
      return this.all.reduce((acc, item) => {
        acc[item.category] = item.color;
        return acc;
      }, {});
    };
    this._colorsCache = this._colorsCache || get();
    return this._colorsCache;
  }
}
