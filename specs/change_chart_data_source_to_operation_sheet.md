# チャートレースのデータソースをoperationシートに変更

## 概要
- Chart Racing機能が表示するデータを、現在の`data`シートから`operation`シートに変更します。
- 既存の`data`シートの定義は残し、`operation`シートを新しいデータソースとして追加します。

## 仕様
### 機能要件
- Chart Racing機能が、`operation`シートのデータを正しく読み込み、チャートを正常に表示すること。
- `operation`シートのデータ形式は`data`シートと同じであること。

### UI/メッセージ
- （UIの変更はなし）
- 確認メッセージ: なし
- 完了メッセージ: なし
- エラーメッセージ: データ取得に失敗した場合、既存のエラーハンドリングに準拠。

### 制約・前提
- `operation`シートはスプレッドシート上に存在し、`data`シートと同じデータ形式を持つこと。
- `BOUND_SHEETS.OPERATION`として`'operation'`が定義されること。

## 実装計画
### 使用するクラス・ファイル
- constants: `src/constants.js` (BOUND_SHEETS.OPERATIONの追加)
- Operation: `src/operations/get_sheet_data_operation.js` (修正)

### 処理フロー
1. `src/constants.js`に`BOUND_SHEETS.OPERATION: 'operation'`を追加。
2. `src/operations/get_sheet_data_operation.js`を修正し、参照するシートを`BOUND_SHEETS.DATA`から`BOUND_SHEETS.OPERATION`に変更。

### 技術的な判断・注意点
- `data`シートと`operation`シートのデータ形式が同じであるため、クライアントサイドのデータパースロジックは変更不要。