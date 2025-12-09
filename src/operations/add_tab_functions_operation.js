import { BaseOperation } from "base_classes/base_operation";

export class AddTabFunctionsOperation extends BaseOperation {
  _operation() {
    const showChartModalOperation = this._createTabFunction({
      name: 'ChartRacing を表示する',
      functionName: 'showChartModalOperation',
    });

    const transformDataOperation = this._createTabFunction({
      name: 'データの変換を実行',
      functionName: 'transformDataOperation',
    });
    
    this._getSpreadsheet().addMenu('カンタン操作', [
      showChartModalOperation,
      transformDataOperation,
    ]);
  }

  _createTabFunction({ name, functionName }) {
    return { name, functionName };
  }
}
