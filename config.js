/* ============================================================
   情報Ⅰ Competition ― 接続設定
   ------------------------------------------------------------
   クラス／グループごとに集計先（Google スプレッドシート＝Apps Script の
   ウェブアプリURL）を分けられる。配布リンクで「どのクラスか（g=）」を
   指定すると、その集計先へ結果が送られる。
   設定手順は apps-script/SETUP.md を参照。
   ============================================================ */
window.APP_CONFIG = {
  endpoints: {
    "TR": "https://script.google.com/macros/s/AKfycbwbeK4hHxq99gDY6SaUih4uSHbmwHxn76rVNWyAzBp7c4c35oV12vljHo3JDVtY8TTVyg/exec",
    "TB": ""   // TB用のウェブアプリURLができたらここに貼る
  },
  // 単一運用時／グループ未指定時のフォールバック（任意）
  endpoint: ""
};
