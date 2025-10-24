import { BaseOperation } from "base_classes/base_operation";
import { BOUND_SHEETS } from "constants";

export class GetSheetDataOperation extends BaseOperation {
  run() {
    const sheetName = BOUND_SHEETS.DATA;
    const data = this._getSheet(sheetName).getDataRange().getValues();
    console.log(data);
    return data;
  }
}
