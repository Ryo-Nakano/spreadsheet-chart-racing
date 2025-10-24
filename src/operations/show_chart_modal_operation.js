import { BaseOperation } from "base_classes/base_operation";

export class ShowChartModalOperation extends BaseOperation {
  run() {
    const template = HtmlService.createTemplateFromFile('chart-modal');
    const html = template.evaluate()
      .setWidth(1000) // モーダルの幅
      .setHeight(1000); // モーダルの高さ
    SpreadsheetApp.getUi().showModalDialog(html, 'ChartRacing');
  }
}
