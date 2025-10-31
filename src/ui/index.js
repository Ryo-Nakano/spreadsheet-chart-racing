import { ChartRacer } from './chart_racer.js';
import { fetchAndParseChartData } from './data_utils.js';

window.addEventListener('load', async () => {
  try {
    const { config, data, categoryColors } = await fetchAndParseChartData();
    new ChartRacer(config, data, categoryColors).init();
  } catch (error) {
    console.error("Chart initialization failed:", error);
  }
});