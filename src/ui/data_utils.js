/**
 * 値を適切な型に変換する関数
 * @param {string} value - 値（文字列）
 * @return {any} - 適切な型に変換された値
 */
function parseValue(value) {
  if (!isNaN(value)) return Number(value); // 数値
  if (value.toLowerCase() === 'true') return true; // 真偽値
  if (value.toLowerCase() === 'false') return false; // 真偽値
  const date = Date.parse(value);
  if (!isNaN(date)) return new Date(date); // 日付
  return value; // 文字列
}

/**
 * CSV文字列をパースし、オブジェクトの配列を返す関数
 * @param {string} csv - CSV形式の文字列
 * @param {string} [delimiter=','] - 区切り文字（デフォルトはカンマ）
 * @return {Array<Object>} - オブジェクトの配列
 */
export function parseCsvToObjects(csv, delimiter = ',') {
  const rows = csv.trim().split('\n').filter(row => row.trim());
  if (rows.length < 2) throw new Error('Invalid CSV: Missing data rows');

  const headers = rows[0].split(delimiter).map(header => header.trim());
  return rows.slice(1).map(row => {
    const values = row.split(delimiter).map(value => value.trim());
    if (values.length !== headers.length) {
      throw new Error(`Row does not match header count: ${row}`);
    }
    return headers.reduce((obj, header, index) => {
      obj[header] = parseValue(values[index]);
      return obj;
    }, {});
  });
}

/**
 * スプレッドシートからCSVデータを取得する
 * @returns {Promise<Array<Array<string>>>}
 */
export async function getCsvDataFromSpreadsheet() {
  // サーバー側からデータが返ってくるのを待つために Promise でラップ
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((data) => {
        console.log("GASから渡ってきた値:", data[0]); // デバッグ用
        resolve(data);
      })
      .withFailureHandler((error) => {
        console.error('データの取得に失敗しました', error);
        reject(error);
      })
      .getSheetDataOperation();
  });
}
