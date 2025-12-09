/**
 * スプレッドシートから初期データ（シートデータと設定）を取得する
 * @returns {Promise<{sheetData: Array<Array<any>>, config: object}>}
 */
export async function getChartInitialData() {
  // サーバー側からデータが返ってくるのを待つために Promise でラップ
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((initialData) => {
        resolve(initialData);
      })
      .withFailureHandler((error) => {
        console.error('初期データの取得に失敗しました。サーバーサイドでエラーが発生しました。');
        console.error('エラー詳細:', error);
        reject(error);
      })
      .getChartInitialDataOperation();
  });
}

/**
 * 2次元配列（シートデータ）をオブジェクトの配列に変換する
 * @param {Array<Array<any>>} sheetData - GASから取得した2次元配列
 * @returns {Array<Object>} オブジェクトの配列
 */
export function parseSheetDataToObjects(sheetData) {
  if (!sheetData || sheetData.length < 2) return [];

  const headers = sheetData[0].map(h => String(h));

  return sheetData.slice(1).map(row => {
    return headers.reduce((obj, header, index) => {
      obj[header] = row[index];
      return obj;
    }, {});
  });
}

/**
 * サーバーからデータを取得し、クライアントサイドで利用可能な形式に整形する
 * @returns {Promise<{config: object, data: Array<Object>, categoryColors: object}>}
 */
export async function fetchAndParseChartData() {
  const initialData = await getChartInitialData();
  if (!initialData || !initialData.config || !initialData.sheetData) {
    throw new Error("Invalid initial data structure from server.");
  }

  const data = parseSheetDataToObjects(initialData.sheetData);

  // データから日付カラムを自動検出し、期間を設定する
  if (data.length > 0) {
    const dateKeys = Object.keys(data[0]).filter(key => /^\d{4}\/\d{2}\/\d{2}$/.test(key));

    if (dateKeys.length > 0) {
      dateKeys.sort();
      initialData.config.startDate = dateKeys[0];
      initialData.config.endDate = dateKeys[dateKeys.length - 1];
    } else {
      console.warn('No date columns found in data header. Using existing config.');
    }
  }

  return {
    config: initialData.config,
    data: data,
    categoryColors: initialData.categoryColors,
  };
}
