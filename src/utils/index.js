/**
 * ユーティリティクラスで、補助的なメソッドを提供します。
 */
export class Utils {
  /**
   * 値が文字列の場合はトリムします。それ以外の場合はそのまま返します。
   *
   * @param {*} value - チェックおよびトリムする値。
   * @returns {*} - 入力が文字列の場合はトリムされた文字列、それ以外の場合は元の値を返します。
   */
  static trimIfString(value) {
    if (typeof value !== "string") return value;
    return value.trim();
  }
}
