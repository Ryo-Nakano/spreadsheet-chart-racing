import { BaseOperation } from "base_classes/base_operation";

export class AddTabFunctionsOperation extends BaseOperation {
  _operation() {
    const showChartModalOperation = this._createTabFunction({
      name: 'モーダルを表示する',
      functionName: 'showChartModalOperation',
    });
    
    this._getSpreadsheet().addMenu('カンタン操作', [
      showChartModalOperation,
    ]);
  }

  _createTabFunction({ name, functionName }) {
    return { name, functionName };
  }
}
