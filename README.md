# Spreadsheet Chart Racing

## 概要 (Overview)

このプロジェクトは、Google スプレッドシート上で動作するインタラクティブな「チャートレーシング」を実装する Google Apps Script (GAS) プログラムです。指定されたシートのデータを基に、時系列での順位変動をアニメーションで可視化します。

This project is a Google Apps Script (GAS) program that implements an interactive "Chart Racing" visualization within a Google Spreadsheet. It visualizes rank changes over time as an animation based on data from a specified sheet.

## 主な機能 (Features)

-   **データの自動集計・変換:** 縦持ち形式（月別・カテゴリ別）の生データを、チャートレース用に集計・累積計算し、横持ち形式に自動変換します。
-   **動的なチャート生成:** 集計されたデータを基に、モーダル上で動的なチャートレーシングを生成します。
-   **柔軟な設定:** スプレッドシートの `config` シートで、チャートのタイトルや期間を自由に変更できます。
-   **簡単な操作:** カスタムメニューからワンクリックで変換やチャート表示を呼び出せます。
-   **滑らかなアニメーション:** `JSCharting`ライブラリにより、視覚的に優れたアニメーションを実現します。

## 技術スタック (Tech Stack)

-   [Google Apps Script](https://developers.google.com/apps-script)
-   JavaScript
-   [JSCharting](https://jscharting.com/)
-   [webpack](https://webpack.js.org/) - モジュールバンドラ
-   [clasp](https://github.com/google/clasp) - GASプロジェクトのローカル開発用CLIツール

## セットアップ (Setup)

1.  **リポジトリをクローン (Clone the repository):**
    ```bash
    git clone https://github.com/Ryo-Nakano/spreadsheet-chart-racing.git
    cd spreadsheet-chart-racing
    ```

2.  **依存関係をインストール (Install dependencies):**
    ```bash
    npm install
    ```

3.  **Google Apps Script プロジェクトのセットアップ (Set up Google Apps Script project):**
    -   Google アカウントにログインします。
        ```bash
        npx clasp login
        ```
    -   スプレッドシートに紐付いた新しい GAS プロジェクトを作成します。
    -   作成したプロジェクトのスクリプトIDを `.clasp.json` ファイルに設定します。
        ```json
        {
          "scriptId": "YOUR_SCRIPT_ID_HERE",
          "rootDir": "./dist"
        }
        ```

## 開発とデプロイ (Development & Deployment)

### 開発 (Development)

ファイルの変更を監視し、自動でビルドとプッシュを行うには、それぞれ別のターミナルで以下のコマンドを実行します。

```bash
npm run build:watch
```
```bash
npm run push:watch
```

### デプロイ (Deployment)

変更をビルドして Google Apps Script プロジェクトにデプロイするには、以下のコマンドを実行します。

```bash
npm run deploy
```

## 使い方 (Usage)

1.  **シートの準備:**
    -   **`data` シート (入力):** 元となる時系列データ（月、カテゴリ、アイテム、数量）を入力します。
    -   **`config` シート (設定):** チャートのタイトル (`title`)、開始日 (`startDate`)、終了日 (`endDate`) などを設定します。
    -   **`operation` シート (出力):** 自動変換されたデータが出力されます（手動編集不要）。
2.  **デプロイ:**
    -   `npm run deploy` でスクリプトをスプレッドシートにデプロイします。
3.  **データの変換:**
    -   スプレッドシートのカスタムメニュー「カンタン操作」から「データの変換を実行」を選択します。
    -   `data` シートの内容が集計・累積計算され、`operation` シートに出力されます。
4.  **チャートの表示:**
    -   カスタムメニューから「ChartRacing を表示する」を選択します。
    -   モーダルダイアログが開き、チャートレーシングが開始されます。

## プロジェクト構造 (Project Structure)

```
/
├── src/
│   ├── operations/      # ユーザー操作に対応する処理
│   ├── utils/           # 汎用的なヘルパー関数
│   ├── sheet_data/      # シートへのデータアクセス処理
│   ├── base_classes/    # 基底クラス
│   └── index.js         # GASのグローバル関数定義 (エントリーポイント)
├── dist/                # claspがデプロイするビルド成果物
├── webpack.config.js    # webpack設定
└── package.json         # プロジェクト設定と依存関係
```
