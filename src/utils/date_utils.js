import { Validators } from "validators";

export class DateUtils {

  /**
   * Google Sheets の WORKDAY.INTL 関数のように、指定された日付から指定された営業日数後の日付を返します。
   * @param {Date} startDate 開始日となる日付オブジェクト。
   * @param {number} numDays 営業日数。正の数の場合は将来の日付、負の数の場合は過去の日付を計算します。
   * @param {string} [weekendCode="1000001"] 週末を表す7文字の文字列（0は平日、1は休日を表す）。例えば、"1000001" は土日が週末であることを意味します。
   * @param {Date[]} [holidays=[]] 休日を表す日付オブジェクトの配列。
   * @param {Date[]} [exceptionalWorkdays=[]] 例外的に営業日として扱う日付の配列。
   * @param {Date[]} [additionalHolidays=[]] 例外的に休日として扱う日付の配列。
   * @returns {Date} 計算後の日付オブジェクト。
   * @throws {Error} 入力が無効な場合にエラーをスローします。
   */
  static workdayIntl(startDate, numDays, weekendCode = "1000001", holidays = [], exceptionalWorkdays = [], additionalHolidays = []) {
    this._validateWorkdayIntlInput(startDate, numDays, weekendCode, holidays, exceptionalWorkdays, additionalHolidays);

    const date = new Date(startDate);
    let workdaysAdded = 0;
    const isFuture = numDays > 0; // 正の場合は将来、負の場合は過去を計算

    while (workdaysAdded < Math.abs(numDays)) {
      if (isFuture) {
        this.setNextDate(date);
      } else {
        this.setPreviousDate(date);
      }

      // 次の日が休日か確認 → 休日の場合は次のループへ
      if (this._isNonWorkday(date, weekendCode, holidays, exceptionalWorkdays, additionalHolidays)) continue;

      // 何営業日異動したかをカウント
      workdaysAdded++;
    }

    return date;
  }

  /**
   * workdayIntl の入力値を検証します。
   * @param {Date} startDate 開始日となる日付オブジェクト。
   * @param {number} numDays 営業日数。
   * @param {string} weekendCode 週末を表す7文字の文字列。
   * @param {Date[]} holidays 休日を表す日付オブジェクトの配列。
   * @param {Date[]} [exceptionalWorkdays=[]] 例外的に営業日として扱う日付の配列。
   * @param {Date[]} [additionalHolidays=[]] 例外的に休日として扱う日付の配列。
   * @throws {Error} 検証が失敗した場合にエラーをスローします。
   */
  static _validateWorkdayIntlInput(startDate, numDays, weekendCode, holidays, exceptionalWorkdays = [], additionalHolidays = []) {
    const errors = [];

    if (!Validators.isValidDate(startDate)) errors.push("startDate must be a valid Date object.");
    if (!Validators.isValidNumber(numDays)) errors.push("numDays must be a valid number.");
    if (!Validators.isValidWeekendCode(weekendCode)) errors.push("weekendCode must be a string of 7 characters, each '0' or '1'.");
    if (!Validators.isValidDateArray(holidays)) errors.push("holidays must be an array of valid Date objects.");
    if (!Validators.isValidDateArray(exceptionalWorkdays)) errors.push("exceptionalWorkdays must be an array of valid Date objects.");
    if (!Validators.isValidDateArray(additionalHolidays)) errors.push("additionalHolidays must be an array of valid Date objects.");

    if (errors.length > 0) throw new Error(errors.join(" "));
  }

  /**
   * 指定された日付が非営業日かどうかを、すべてのルールを考慮して判断します。
   * @param {Date} date チェック対象の日付オブジェクト。
   * @param {string} weekendCode 週末を表す7文字の文字列。
   * @param {Date[]} holidays 休日を表す日付オブジェクトの配列。
   * @param {Date[]} exceptionalWorkdays 例外的に営業日として扱う日付の配列。
   * @param {Date[]} additionalHolidays 例外的に休日として扱う日付の配列。
   * @returns {boolean} 非営業日であれば true、そうでなければ false。
   * @private
   */
  static _isNonWorkday(date, weekendCode, holidays, exceptionalWorkdays, additionalHolidays) {
    // 1. 例外的な営業日か？
    if (this.isHoliday(date, exceptionalWorkdays)) {
      return false; // 営業日なので非営業日ではない
    }

    // 2. 追加の休日か？
    if (this.isHoliday(date, additionalHolidays)) {
      return true; // 休日なので非営業日
    }

    // 3. 従来の休日判定
    return this.isWeekend(date, weekendCode) || this.isHoliday(date, holidays);
  }

  /**
   * 指定した日付が週末かどうかを判断します。
   * @param {Date} date チェック対象の日付オブジェクト。
   * @param {string} weekendCode 週末を表す7文字の文字列。
   * @returns {boolean} 週末であれば true、そうでなければ false。
   * @throws {Error} 入力が無効な場合にエラーをスローします。
   */
  static isWeekend(date, weekendCode) {
    if (!Validators.isValidDate(date)) throw new Error("date must be a valid Date object.");
    if (!Validators.isValidWeekendCode(weekendCode)) throw new Error("weekendCode must be a string of 7 characters, each '0' or '1'.");

    const dayOfWeek = date.getDay(); // { 日: 0, 月: 1, 火: 2, ... 土: 6 }
    return weekendCode[dayOfWeek] === '1'; // { 平日: 0, 休日: 1 } だから
  }

  /**
   * 指定した日付が休日かどうかを判断します。
   * @param {Date} date チェック対象の日付オブジェクト。
   * @param {Date[]} holidays 休日を表す日付オブジェクトの配列。
   * @returns {boolean} 休日であれば true、そうでなければ false。
   * @throws {Error} 入力が無効な場合にエラーをスローします。
   */
  static isHoliday(date, holidays) {
    if (!Validators.isValidDate(date)) throw new Error("date must be a valid Date object.");
    if (!Validators.isValidDateArray(holidays)) throw new Error("holidays must be an array of valid Date objects.");
    
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday);
      return holidayDate.getFullYear() === date.getFullYear() &&
             holidayDate.getMonth() === date.getMonth() &&
             holidayDate.getDate() === date.getDate();
    });
  }

  /**
   * 日付オブジェクトを翌日に進めます。
   * @param {Date} date 更新対象の日付オブジェクト。
   * @throws {Error} 入力が無効な場合にエラーをスローします。
   */
  static setNextDate(date) {
    if (!Validators.isValidDate(date)) throw new Error("date must be a valid Date object.");
    date.setDate(date.getDate() + 1);
  }

  /**
   * 日付オブジェクトを前日に戻します。
   * @param {Date} date 更新対象の日付オブジェクト。
   * @throws {Error} 入力が無効な場合にエラーをスローします。
   */
  static setPreviousDate(date) {
    if (!Validators.isValidDate(date)) throw new Error("date must be a valid Date object.");
    date.setDate(date.getDate() - 1);
  }

  /**
   * yymmdd 形式の数値を JavaScript の Date オブジェクトに変換します。
   * yymmdd 形式は以下のように解釈されます:
   * - 最初の2桁は年（2000年代と仮定）
   * - 次の2桁は月
   * - 最後の2桁は日
   *
   * @param {number} yymmdd yymmdd 形式の6桁の数値。
   * @returns {Date} 入力された yymmdd に対応する JavaScript の Date オブジェクト。
   * @throws {Error} 入力が有効な6桁の yymmdd 数値でない場合にエラーをスローします。
   */
  static convertYymmddToDate(yymmdd) {
    if(!Validators.isValidYymmdd(yymmdd)) throw new Error("yymmdd must be a 6-digit number.");
    
    // yymmdd 形式の文字列を分割して年、月、日を取得
    const yymmddStr = `${yymmdd}`;
    const year = parseInt('20' + yymmddStr.substring(0, 2), 10);  // "20"を追加して西暦に変換
    const month = parseInt(yymmddStr.substring(2, 4), 10) - 1;    // 月は0-11で表すため -1
    const day = parseInt(yymmddStr.substring(4, 6), 10);
  
    return new Date(year, month, day);
  }

  /**
   * yyyymmdd 形式の8桁の数値を Date オブジェクトに変換します。
   * 入力される yyyymmdd は、年、月、日を表す8桁の数値です。
   *
   * @param {number} yyyymmdd yyyymmdd 形式の8桁の数値。
   * @returns {Date} 入力された yyyymmdd を基にした Date オブジェクトを返します。
   * @throws {Error} 入力が有効な8桁の yyyymmdd 形式の数値でない場合にエラーをスローします。
   */
  static convertYyyymmddToDate(yyyymmdd) {
    if(!Validators.isValidYyyymmdd(yyyymmdd)) throw new Error("yyyymmdd must be an 8-digit number.");
    
    // yyyymmdd 形式の文字列を分割して年、月、日を取得
    const yyyymmddStr = `${yyyymmdd}`;
    const year = parseInt(yyyymmddStr.substring(0, 4), 10);
    const month = parseInt(yyyymmddStr.substring(4, 6), 10) - 1; // JavaScriptでは月が0から始まるので -1
    const day = parseInt(yyyymmddStr.substring(6, 8), 10);
  
    return new Date(year, month, day);
  }

  /**
   * yymmdd もしくは yyyymmdd 形式の数値を受け取って、Date オブジェクトに変換します。
   * 6桁の場合は yymmdd として、8桁の場合は yyyymmdd として処理されます。
   *
   * @param {number} dateNum yymmdd もしくは yyyymmdd 形式の数値。
   * @returns {Date} 入力された数値を基にした Date オブジェクトを返します。
   * @throws {Error} 入力が有効な6桁または8桁の数値でない場合にエラーをスローします。
   */
  static convertToDate(dateNum) {
    const dateStr = `${dateNum}`;

    switch (dateStr.length) {
      case 6:
        return this.convertYymmddToDate(dateNum);
      case 8:
        return this.convertYyyymmddToDate(dateNum);
      default:
        throw new Error("Input must be a 6-digit or 8-digit number.");
    }
  }

  /**
   * yymmdd 形式の6桁の数値を yyyy/mm/dd 形式の文字列に変換します。
   * 入力される yymmdd は、年、月、日を表す6桁の数値です。
   *
   * @param {number} yymmdd - yymmdd 形式の6桁の数値。
   * @returns {string} yyyy/mm/dd 形式の文字列を返します。
   * @throws {Error} 入力が有効な6桁の yymmdd 形式の数値でない場合にエラーをスローします。
   */
  static convertYymmddToYyyymmddStr(yymmdd) {
    if(!Validators.isValidYymmdd(yymmdd)) throw new Error("yymmdd must be a 6-digit number.");
    const yymmddStr = `${yymmdd}`;
    const year = '20' + yymmddStr.slice(0, 2);
    const month = yymmddStr.slice(2, 4);
    const day = yymmddStr.slice(4, 6);
    return `${year}/${month}/${day}`;
  }

  /**
   * yyyymmdd 形式の8桁の数値を yyyy/mm/dd 形式の文字列に変換します。
   * 入力される yyyymmdd は、年、月、日を表す8桁の数値です。
   *
   * @param {number} yyyymmdd - yyyymmdd 形式の8桁の数値。
   * @returns {string} yyyy/mm/dd 形式の文字列を返します。
   * @throws {Error} 入力が有効な8桁の yyyymmdd 形式の数値でない場合にエラーをスローします。
   */
  static convertYyyymmddToYyyymmddStr(yyyymmdd) {
    if(!Validators.isValidYyyymmdd(yyyymmdd)) throw new Error("yyyymmdd must be an 8-digit number.");
    const yyyymmddStr = `${yyyymmdd}`;
    const year = yyyymmddStr.slice(0, 4);
    const month = yyyymmddStr.slice(4, 6);
    const day = yyyymmddStr.slice(6, 8);
    return `${year}/${month}/${day}`;
  }

  /**
   * yymmdd もしくは yyyymmdd 形式の数値を受け取って、yyyy/mm/dd 形式の文字列に変換します。
   * 6桁の場合は yymmdd として、8桁の場合は yyyymmdd として処理されます。
   *
   * @param {number} dateNum - yymmdd もしくは yyyymmdd 形式の数値。
   * @returns {string} yyyy/mm/dd 形式の文字列を返します。
   * @throws {Error} 入力が有効な6桁または8桁の数値でない場合にエラーをスローします。
   */
  static convertToYyyymmddStr(dateNum) {
    const dateStr = `${dateNum}`;

    switch (dateStr.length) {
      case 6:
        return this.convertYymmddToYyyymmddStr(dateNum);
      case 8:
        return this.convertYyyymmddToYyyymmddStr(dateNum);
      default:
        throw new Error("Input must be a 6-digit or 8-digit number.");
    }
  }

  /**
   * 指定された日付オブジェクトから時間情報を除去した新しい日付オブジェクトを返します。
   * 返されるオブジェクトは、年月日のみが設定され、時分秒およびミリ秒はすべて 0 に初期化されます。
   *
   * @param {Date} date 時間情報を除去したい元の日付オブジェクト。
   * @returns {Date} 時間情報が除去された新しい日付オブジェクト。
   * @throws {Error} date が有効な Date オブジェクトでない場合にエラーをスローします。
   */
  static getDateWithoutTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Date オブジェクトを yyyymmdd 形式の数値に変換します。
   *
   * @param {Date} date 変換対象の Date オブジェクト。
   * @returns {number} yyyymmdd 形式の数値。
   * @throws {Error} 入力が有効な Date オブジェクトでない場合にエラーをスローします。
   */
  static convertToYyyymmddNum(date) {
    if (!Validators.isValidDate(date)) throw new Error("date must be a valid Date object.");
    const yyyymmddStr = Utilities.formatDate(date, 'JST', 'yyyyMMdd');
    return parseInt(yyyymmddStr, 10);
  }

  /**
   * Date オブジェクトを yyyy/MM/dd 形式の文字列に変換します。
   * @param {Date} date 変換するDateオブジェクト。
   * @returns {string} yyyy/MM/dd 形式の文字列。
   */
  static convertDateToYyyymmddStr(date) {
    if (!Validators.isValidDate(date)) return '';
    return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd');
  }
}
