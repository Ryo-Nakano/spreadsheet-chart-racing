import { BaseOperation } from "base_classes/base_operation";
import { BOUND_SHEETS } from "constants";

export class GetConfigOperation extends BaseOperation {
  _operation() {
    const sheet = this._getSheet(BOUND_SHEETS.CONFIG);
    const data = sheet.getDataRange().getValues();
    const config = data.reduce((acc, [key, value]) => {
      if (key) {
        acc[key] = value instanceof Date ? value.toISOString() : value;
      }
      return acc;
    }, {});

    return config;
  }
}
