# Spreadsheet Chart Racing

## 概要 (Overview)

このプロジェクトは、Google スプレッドシート上で動作するインタラクティブな「チャートレーシング」を実装する Google Apps Script (GAS) プログラムです。指定されたシートのデータを基に、時系列での順位変動をアニメーションで可視化します。

This project is a Google Apps Script (GAS) program that implements an interactive "Chart Racing" visualization within a Google Spreadsheet. It visualizes rank changes over time as an animation based on data from a specified sheet.

## 主な機能 (Features)

-   **動的なチャート生成:** スプレッドシートのデータを基に、モーダル上で動的なチャートレーシングを生成します。
-   **簡単な操作:** カスタムメニューからワンクリックでチャートを呼び出せます。
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

1.  `npm run deploy` でスクリプトをデプロイします。
2.  スプレッドシートを開き、追加されたカスタムメニューから「ChartRacing を表示」を選択します。
3.  モーダルダイアログが開き、チャートレーシングが開始されます。

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
