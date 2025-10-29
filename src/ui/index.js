import { ChartRacer } from './chart_racer.js';
import { getChartInitialData, parseCsvToObjects } from './data_utils.js';

window.addEventListener('load', async () => {
  const initialData = await getChartInitialData();
  const config = initialData.config;
  const csvText = initialData.sheetData.map(row => row.join(',')).join('\n');
  const data = parseCsvToObjects(csvText);

  new ChartRacer(config, data).init();
});