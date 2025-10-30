import { ChartRacer } from './chart_racer.js';
import { fetchAndParseChartData } from './data_utils.js';

window.addEventListener('load', async () => {
  try {
    const { config, data } = await fetchAndParseChartData();
    new ChartRacer(config, data).init();
  } catch (error) {
    console.error("Chart initialization failed:", error);
  }
});