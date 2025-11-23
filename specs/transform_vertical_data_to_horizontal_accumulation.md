# データ変換処理 (縦持ち→横持ち累積)

## 概要
縦持ち形式のデータ（月別の数量データ）を、横持ち形式（月を列に展開）に変換し、累積値を計算して`operation`シートに出力します。
チャートレース用のデータソースを作成するための処理です。

## 仕様
### 機能要件
1.  **Input (`data`シート)**
    *   データ構造: `month` (A列), `category` (B列), `item` (C列), `quantity` (D列)
    *   ヘッダー: 1行目
    *   データ: 2行目以降
    *   **サンプルデータ**:
        ```
        month       category     item      quantity
        2025/01     category_A   item_A    10
        2025/01     category_A   item_B    5
        2025/01     category_B   item_C    10
        2025/02     category_A   item_A    5
        2025/02     category_A   item_B    10
        2025/02     category_B   item_C    20
        2025/03     category_A   item_A    5
        2025/03     category_A   item_B    5
        2025/03     category_B   item_C    10
        2025/03     category_B   item_D    20
        2025/04     category_A   item_A    10
        2025/04     category_A   item_B    10
        2025/04     category_B   item_C    20
        2025/04     category_B   item_D    5
        ```

2.  **処理ロジック詳細**
    *   **データの正規化と検証**:
        *   **Month (A列)**:
            *   `Date`オブジェクト、および `yyyy/MM`, `yyyy/MM/dd`, `yyyy-MM-dd` 等の日付として解釈可能な文字列を広く許容。
            *   全て `YYYY/MM/DD` 形式の文字列（日付は必ず `01` 日に丸める。例: "2025/01/15" → "2025/01/01"）に正規化して扱う。
            *   日付として解釈できない値が入っている行は**スキップ**する。
        *   **Category (B列) / Item (C列)**:
            *   前後の空白（トリム）を除去して扱う。
            *   空文字（または空白のみ）の場合は、その行を**スキップ**する。
        *   **Quantity (D列)**:
            *   数値変換 (`Number()`) を行う。
            *   数値に変換できない場合（`NaN`）、または `null`/`undefined` の場合は、その行を**スキップ**する。
    *   **集約と累積**:
        *   正規化した `item` × `category` をキーとしてデータをグループ化。
        *   同一月・同一キーのデータは数量を合算。
        *   抽出した全月リスト（`YYYY/MM/DD`形式の文字列、各月1日とする）を文字列として昇順ソート。
        *   各月までの累積値を計算 (`累積値(n) = 累積値(n-1) + 当月数量`)。
        *   データが存在しない月の当月数量は `0` として扱う（累積値は前月を引き継ぐ）。

3.  **Output (`operation`シート)**
    *   既存データを全てクリア。
    *   出力列: `item` (A列), `category` (B列), 各月 (C列以降)
    *   ヘッダー行を出力（日付は `YYYY/MM/DD` 形式）。
    *   **サンプル出力**:
        ```
        item     category     2025/01/01   2025/02/01   2025/03/01   2025/04/01
        item_A   category_A   10           15           20           30
        item_B   category_A   5            15           20           30
        item_C   category_B   10           30           40           60
        item_D   category_B   0            0            20           25
        ```

### UI/メッセージ
*   **メニュー**:
    *   親メニュー: "カンタン操作"
    *   項目名: "データの変換を実行"
    *   実行関数名: `transformDataOperation`
*   **エラーメッセージ**:
    *   `throw new Error("メッセージ")` で通知する。
    *   `data`シートが存在しない場合: "dataシートが見つかりません。"
    *   `operation`シートが存在しない場合: "operationシートが見つかりません。"
    *   データが空の場合: "処理対象のデータが存在しません。"

### 制約・前提
*   実装言語: Google Apps Script
*   `operation`シートは事前に存在するものとする（自動作成しない）。
*   `BOUND_SHEETS.DATA` ('data') および `BOUND_SHEETS.OPERATION` ('operation') を使用。

## 実装計画
### 使用するクラス・ファイル
*   **Operation**: `src/operations/transform_data_operation.js` (新規作成)
    *   データ変換と入出力のメインロジックを担当。
*   **DAO**:
    *   `src/sheet_data/bound_sheet/data_sheet_data.js` (新規作成)
        *   `data`シートへのアクセス、生データの取得を担当。
    *   `src/sheet_data/bound_sheet/operation_sheet_data.js` (新規作成)
        *   `operation`シートへのアクセス、データの書き込みを担当。
        *   **実装方針**: 列数が可変であるため、プロパティマッピングは行わない薄いラッパーとする。
        *   **API**: `all` (全取得), `setValues` (一括書き込み), `clear` (全消去) のみを提供し、ビジネスロジックとの責務分離を徹底する。
*   **Constants**: `src/constants.js`
    *   (既存の `BOUND_SHEETS` を利用)

### 処理フロー
1.  `TransformDataOperation` を実行。
2.  `DataSheetData` と `OperationSheetData` のインスタンス化。
3.  **検証**: 各シートの存在確認。存在しない場合はエラーをスロー。
4.  **読み込み**: `DataSheetData` から全データを取得（2次元配列）。
    *   空チェックを行う。
5.  **データ変換**:
    *   データを走査し、`key = item + "_" + category` 等でMapに集約。月ごとの合計を保持。
    *   全ての月 (`YYYY/MM`) をSet等で収集し、ソートしてユニークな月リストを作成。
    *   各グループについて、月リスト順にループし、累積値を計算して出力用配列（行データ）を作成。
6.  **書き込み**: `OperationSheetData` を使用して、`operation`シートの内容をクリアし、ヘッダーと計算結果の行データを一括書き込み (`setValues`)。

### 技術的な判断・注意点
*   **パフォーマンス**:
    *   セルごとの読み書きは避け、`getValues()`, `setValues()` で一括処理を行う。
    *   集計処理には `Map` または `Object` を使用し、ループ回数を最小限にする。
*   **型の扱い**:
    *   `month`列は `Date` オブジェクトまたは文字列 (`YYYY/MM`) の可能性があるため、統一した文字列表現 (`YYYY/MM`) に変換して扱う。
    *   `quantity` は数値として扱う（パースが必要な場合は行う）。
*   **キー生成**:
    *   集計キーは単純な文字列連結 (`item + "_" + category`) を使用する。`item` や `category` に区切り文字が含まれる場合の衝突リスクは許容する。
*   **拡張性**:
    *   将来的に列が増えても対応できるよう、固定列以外は動的に処理する。
