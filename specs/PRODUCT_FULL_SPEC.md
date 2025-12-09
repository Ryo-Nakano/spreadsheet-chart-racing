# 製品完全仕様書 (PRODUCT_FULL_SPEC.md)

本書は、「Spreadsheet Chart Racing」ツールの包括的かつ網羅的な仕様書です。製品の挙動、データ構造、機能ロジックに関する唯一の信頼できる情報源（Single Source of Truth）として、開発者、ドキュメント作成者、およびシステムの深い理解を必要とする外部関係者が利用することを想定しています。

## 1. システム概要 (System Overview)

### 1.1 製品定義
**Spreadsheet Chart Racing** は、Google スプレッドシート内で動作する Google Apps Script (GAS) アプリケーションです。ユーザーはこれを使用することで、時系列データを「バーチャートレース（Bar Chart Race）」としてアニメーション化し、時間の経過とともに累積値に基づいて順位が変動する様子を可視化できます。

### 1.2 アーキテクチャ
本システムは、Google のインフラストラクチャ上で完結するクライアント・サーバーアーキテクチャで動作します。

*   **バックエンド (サーバー):** Google Apps Script (ES6+、Babel/Webpack経由)。データの保存、取得、ETL (Extract, Transform, Load) 処理、および HTML フロントエンドの提供を担当します。
*   **フロントエンド (クライアント):** Google スプレッドシートのモーダルダイアログ内で動作する HTML5/JavaScript アプリケーションです。可視化のレンダリングには **JSCharting** を使用しています。
*   **データストア:** Google スプレッドシートの各シートが、入力データ (`data`, `config`, `categories`) および中間出力データ (`operation`) の主要なデータベースとして機能します。
*   **デプロイ:** **Clasp** (Command Line Apps Script Projects) によって管理され、**Webpack** でバンドルされます。

---

## 2. データ構造とI/O仕様 (Data Structures & I/O Specifications)

本アプリケーションは、特定の4つのシートに依存しています。これらのシートの存在と構造は必須です。

### 2.1 入力: `data` シート
生のトランザクションデータソースです。

*   **構造:**
    *   1行目: ヘッダー行（処理中はスキップされます）。
    *   カラム（名前付き範囲のマッピングによる）:
        *   `DATA.MONTH`: 日付または文字列（日付として解析可能であること）。タイムバケットを表します。
        *   `DATA.CATEGORY`: 文字列。グループ化の識別子（色分けに使用）。
        *   `DATA.ITEM`: 文字列。追跡対象のエンティティ（例：商品名、人物名）。
        *   `DATA.QUANTITY`: 数値。その期間の増分値。
*   **バリデーションと制約:**
    *   **Month:** 有効な日付または解析可能な文字列である必要があります。無効な日付は無視されます。各月の1日に正規化されます（例: `2023-01-15` -> `2023/01/01`）。
    *   **Category/Item:** 空ではない文字列である必要があります。空の値を含む行はスキップされます。前後の空白は削除（トリム）されます。
    *   **Quantity:** 有効な数値である必要があります。`null`、`undefined`、または数値以外の文字列を含む行はスキップされます。
*   **サンプルデータ (Sample Data):**
    ```
    month       category     item      quantity
    2025/01/01  category_A   item_A    10
    2025/01/01  category_A   item_B    5
    2025/01/01  category_B   item_C    10
    2025/02/01  category_A   item_A    5
    2025/02/01  category_A   item_B    10
    2025/02/01  category_B   item_C    20
    2025/03/01  category_A   item_A    5
    2025/03/01  category_A   item_B    5
    2025/03/01  category_B   item_C    10
    2025/03/01  category_B   item_D    20
    2025/04/01  category_A   item_A    10
    2025/04/01  category_A   item_B    10
    2025/04/01  category_B   item_C    20
    2025/04/01  category_B   item_D    5
    ```

### 2.2 設定: `config` シート
可視化に関する全体設定です。

*   **構造:** Key-Value ペア形式。
    *   `CONFIG.KEY`: 設定識別子。
    *   `CONFIG.VALUE`: 設定値。
    *   `CONFIG.MEMO`: （任意）説明。
*   **サポートされているキー:**
    *   `title`: (String) チャートに表示されるメインタイトル。
    *   `startDate`: (Date/String) *フロントエンドの自動検知により上書きされます。*
    *   `endDate`: (Date/String) *フロントエンドの自動検知により上書きされます。*
    *   `frameDelay`: (Number) 1フレームあたりのアニメーション速度（ミリ秒）。（通常はコードロジック内のデフォルト値 `500` 程度、または `setTimeout` ループによって決定されます）。

### 2.3 マスタデータ: `categories` シート
カテゴリごとのスタイル定義です。

*   **構造:**
    *   `CATEGORIES.CATEGORY`: 文字列。`data` シートの Category カラムの値と一致します。
    *   `CATEGORIES.COLOR`: 文字列。16進カラーコード（例: `#FF5733`）または色名。
*   **挙動:**
    *   チャート内のバーに特定の色をマッピングするために使用されます。
    *   ここで定義されていないカテゴリには、デフォルト色 (`#CCCCCC`) が適用されます。

### 2.4 出力: `operation` シート
チャートエンジン用に最適化・変換されたデータです。**手動で編集しないでください。**

*   **構造:** ワイド形式（マトリックス）。
    *   A列: `item`
    *   B列: `category`
    *   C列以降: 動的な日付カラム（`yyyy/MM/dd` 形式、例: `2023/01/01`, `2023/02/01`...）。
*   **内容:**
    *   各セルには、そのアイテムのその月までの **累積和 (Running Total)** が格納されます。
*   **サンプル出力 (Sample Output):**
    ```
    item     category     2025/01/01   2025/02/01   2025/03/01   2025/04/01
    item_A   category_A   10           15           20           30
    item_B   category_A   5            15           20           30
    item_C   category_B   10           30           40           60
    item_D   category_B   0            0            20           25
    ```

---

## 3. データ処理ロジック (Data Processing Logic)

### 3.1 ETLプロセス (`TransformDataOperation`)
メニューの「データの変換を実行」からトリガーされます。このプロセスは、生の `data` を `operation` に変換します。

1.  **読み込み (Read):** `data` シートから全行を読み込みます。
2.  **フィルタリングと正規化 (Filter & Normalize):**
    *   各行を反復処理します。
    *   **日付の正規化:** `DATA.MONTH` を Date オブジェクトに変換し、日を `1` に設定して `yyyy/MM/dd` 形式にします。
    *   **バリデーション:** 無効な日付、空のアイテム/名前、または数値以外の数量を持つ行をスキップします。
3.  **集約 (Aggregate):**
    *   ユニークキー `${item}_${category}` でデータをグループ化します。
    *   そのグループ内の各ユニークな月について `quantity` を合計します。
4.  **ソート (Sort):**
    *   データセット全体で見つかったすべてのユニークな月を収集し、時系列順にソートします。
5.  **累積計算 (Cumulative Calculation) - コアロジック:**
    *   各ユニークな Item/Category グループについて反復処理します。
    *   ソートされたタイムライン上の各月について:
        *   その月の集約された数量を取得します（存在しない場合は0）。
        *   それを実行中の `accumulated`（累積）変数に加算します。
        *   その `accumulated` 値をマトリックスに格納します。
    *   *注記:* つまり、チャートは「月次売上」ではなく、「現在までの総売上」や「総人口」を可視化することになります。
6.  **書き込み (Write):**
    *   `operation` シート全体を **クリア** します。
    *   生成されたヘッダー行とデータマトリックスを書き込みます。

---

## 4. ユーザーインターフェース仕様 (User Interface Specifications)

### 4.1 スプレッドシートメニュー
スプレッドシートのUIに **「カンタン操作」** というカスタムメニューが追加されます。
*   **「データの変換を実行」**: `TransformDataOperation` をトリガーします。完了時にアラートを表示します。
*   **「ChartRacing を表示する」**: `ShowChartModalOperation` をトリガーします。

### 4.2 チャートモーダル
*   **タイトル:** "ChartRacing"
*   **サイズ:** 1000px (幅) x 1000px (高さ)
*   **初期化:**
    1.  フロントエンドが `google.script.run.getChartInitialDataOperation()` を呼び出します。
    2.  サーバーは `sheetData` (`operation` シート由来)、`config`、および `categoryColors` を返します。
    3.  **自動検知:** フロントエンドは `sheetData` のヘッダーを解析し、`yyyy/MM/dd` に一致するすべてのカラムを検出します。
        *   `config.startDate` を、検出された *最も古い* 日付に設定します。
        *   `config.endDate` を、検出された *最も新しい* 日付に設定します。
        *   *注記:* これにより、`config` シートに手動で入力された日付設定は上書きされます。

### 4.3 可視化 (JSCharting)
*   **タイプ:** 横向きコラムチャート (`horizontal column solid`)。
*   **Y軸:** アイテム（例：商品名）を表します。
*   **X軸:** 累積数量（値）を表します。
*   **アニメーションループ:**
    *   `config.frameDelay` に基づいて `setTimeout` を使用します。
    *   各ステップで `currentDate` を1ヶ月ずつ進めます。
    *   チャートのシリーズデータとスライダーの位置を更新します。
*   **コントロール:**
    *   **スライダー:** インタラクティブなタイムライン。ドラッグすることでチャートを特定の時点に更新できます。
    *   **Play/Pause ボタン:** アニメーションループの再生/一時停止を切り替えます。アイコンが変化します（`play` / `pause`）。
*   **視覚要素:**
    *   **バー:** `categoryColors` に基づいて色付けされます。フォールバック色は `#CCCCCC` です。
    *   **凡例:** 右上に表示されます。カテゴリ名と色のアイコンを表示します。
    *   **アノテーション (右下):**
        *   **月:** 短縮形式（例: "Jan", "1月"）。
        *   **年:** 西暦（例: "2023"）。
        *   **合計:** 表示されているすべての値の合計を数値フォーマットで表示します。

---

## 5. 開発・環境仕様 (Development & Environment)

### 5.1 プロジェクト構造
*   `src/index.js`: エントリーポイント。メニューや `google.script.run` 用のグローバル関数を公開します。
*   `src/operations/`: ビジネスロジッククラス（Command パターン）を含みます。
*   `src/sheet_data/`: SpreadsheetApp アクセスのための抽象化レイヤー（Active Record スタイル）です。
*   `src/ui/`: フロントエンドアセット（JS, HTMLテンプレート）です。

### 5.2 ビルドシステム
*   **Webpack:** サーバーサイド JS を単一の `dist/Code.gs` ファイルにバンドルし、GAS での ES6 モジュールをサポートします。
*   **Babel:** GAS 互換性のためにモダン JS をトランスパイルします。
*   **HtmlWebpackPlugin:** クライアントサイドの JS/CSS を `dist/chart-modal.html` にインライン化します。

### 5.3 ライブラリ依存関係
*   **JSCharting:** HTMLテンプレート内で CDN 経由でロードされます。可視化エンジンのコアとして使用されます。
