// src/operations/get_category_colors_operation.js

import { BaseOperation } from 'base_classes/base_operation';
import { Categories } from 'sheet_data/bound_sheet/categories';

/**
 * 'categories'シートからカテゴリと色の対応を取得するオペレーション。
 * @returns {Object.<string, string>} カテゴリ名をキー、カラーコードを値とするオブジェクト。
 */
export class GetCategoryColorsOperation extends BaseOperation {
  constructor() {
    super();
  }

  /**
   * @override
   */
  _operation() {
    // Categoriesクラス経由でデータを取得するように変更
    return Categories.colors;
  }
}
