# 情報Ⅰ Competition

解答速度と正答率でスコア化する、情報Ⅰの単発スピードクイズ。
生徒は各自の端末で受験し、結果は担当者の Google スプレッドシートへ集計・ランキング表示できます。

## 使い方
- **生徒用**：`index.html`（配布リンクから開く）
- **担当者用**：`teacher.html`
  - ①配布する … 公開URL・課題名を入れて配布リンク／QR を作成
  - ②ランキング … クイズ（集計タブ）を選んで順位・表彰台を表示
- **結果回収の準備**：`apps-script/SETUP.md`（Google Apps Script を1度デプロイ → `config.js` の `endpoint` に URL を設定）

ライト／ダークは右上のアイコンで切り替え（既定はライト）。

## 構成
```
index.html          受験画面
teacher.html        配布リンク作成・ランキング表示
config.js           送信先（Apps Script URL）
data/questions.js   出題データ
assets/             図版
apps-script/        集計バックエンド（Code.gs）＋セットアップ手順
```
