import { TestOperation } from "operations/test_operation";
import { AddTabFunctionsOperation } from "operations/add_tab_functions_operation";
import { ShowChartModalOperation } from "operations/show_chart_modal_operation";
import { GetSheetDataOperation } from "operations/get_sheet_data_operation";
import { GetConfigOperation } from "operations/get_config_operation";
import { GetCategoryColorsOperation } from "operations/get_category_colors_operation";

global.TEST = () => {
  const operation = new TestOperation();
  operation.run();
};

global.onOpen = () => {
  const operation = new AddTabFunctionsOperation();
  operation.run();
};

global.addTabFunctionsOperation = () => {
  const operation = new AddTabFunctionsOperation();
  operation.run();
};

global.showChartModalOperation = () => {
  const operation = new ShowChartModalOperation();
  operation.run();
};

global.getChartInitialDataOperation = () => {
  const sheetData = new GetSheetDataOperation().run();
  const configData = new GetConfigOperation().run();
  const categoryColors = new GetCategoryColorsOperation().run();
  return {
    sheetData: sheetData,
    config: configData,
    categoryColors: categoryColors,
  };
};
