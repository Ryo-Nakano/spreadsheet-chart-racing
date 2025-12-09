import { BaseOperation } from "base_classes/base_operation";
import { OperationSheetData } from "sheet_data/bound_sheet/operation_sheet_data";

export class GetSheetDataOperation extends BaseOperation {
  _operation() {
    return OperationSheetData.formattedAll;
  }
}
