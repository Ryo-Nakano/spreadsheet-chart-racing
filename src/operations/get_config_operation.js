import { BaseOperation } from "base_classes/base_operation";
import { Config } from "sheet_data/config";

export class GetConfigOperation extends BaseOperation {
  _operation() {
    return Config.all;
  }
}
