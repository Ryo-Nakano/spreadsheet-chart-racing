import { BaseOperation } from "base_classes/base_operation";
import { BOUND_SHEETS } from "constants";

export class GetSheetDataOperation extends BaseOperation {
  _operation() {
    const sheet = this._getSheet(BOUND_SHEETS.DATA);
    const data = sheet.getDataRange().getValues();
    return data;
  }
}
