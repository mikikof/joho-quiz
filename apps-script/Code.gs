/**********************************************************************
 * 情報Ⅰ Competition ― 結果受信＆ランキング用 Google Apps Script
 * --------------------------------------------------------------------
 * 1つのスプレッドシートの中で、クイズ（課題名）ごとに専用タブを自動作成し、
 * そのタブへ結果を振り分けて集計する。
 *   - 受験結果(POST)            … 課題名のタブに1行ずつ追記（無ければ自動作成）
 *   - タブ一覧(GET ?sheets=1)   … 先生がランキング対象を選ぶための一覧
 *   - ランキング(GET ?ranking=1&sheet=タブ名) … そのタブを集計して JSONP で返す
 *
 * 設置: 集計用スプレッドシート → 拡張機能 → Apps Script に貼り付け、
 *       ウェブアプリとしてデプロイ。URL を config.js の endpoint に設定。
 *       手順は SETUP.md を参照。
 **********************************************************************/

// ★ スプレッドシートに「拡張機能 → Apps Script」から作った場合は空のままでOK。
//   script.google.com で単独作成（スタンドアロン）の場合は、集計シートの URL
//   https://docs.google.com/spreadsheets/d/【ここがID】/edit の ID を貼る。
var SHEET_ID = '';

function ss_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

var HEADERS = [
  '受信日時','課題名','クイズID','氏名','学籍番号',
  'スコア','正解','問題数','正答率(%)','合計タイム(秒)',
  '離脱回数','離脱(秒)','再提出','開始時刻','提出時刻','UA'
];
var DEFAULT_TAB = '未分類';

/* ============ 受験結果の受信 ============ */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse(e.postData.contents);
    var tab = sanitizeTab_(d.sheet || d.title);   // 課題名ごとのタブへ振り分け
    var sheet = getTab_(tab);
    sheet.appendRow([
      new Date(),
      str_(d.title), str_(d.quizId), str_(d.name), str_(d.studentId),
      num_(d.score), num_(d.correct), num_(d.count), num_(d.accuracyPct), num_(d.timeSec),
      num_(d.awayCount), num_(d.awaySec),
      d.resubmit ? '再提出' : '',
      str_(d.startedAt), str_(d.submittedAt), str_(d.ua)
    ]);
    return json_({ ok: true, tab: tab });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* ============ ランキング / タブ一覧 / 動作確認 ============ */
function doGet(e) {
  e = e || {}; var p = e.parameter || {};
  if (p.sheets === '1') return listSheets_(p);
  if (p.ranking === '1') return ranking_(p);
  return ContentService.createTextOutput('情報Ⅰ Competition 受信サーバーは稼働中です。');
}

function listSheets_(p) {
  var names = ss_().getSheets().map(function (s) { return s.getName(); });
  return jsonp_(p.callback, { ok: true, sheets: names });
}

function ranking_(p) {
  var name = sanitizeTab_(p.sheet);
  var ss = ss_();
  var sheet = ss.getSheetByName(name);
  var rows = [];
  if (sheet && sheet.getLastRow() >= 2) {
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
    var best = {};
    for (var i = 0; i < values.length; i++) {
      var v = values[i];
      var nm = String(v[3]), sid = String(v[4]);
      var rec = {
        name: nm, studentId: sid,
        score: Number(v[5]) || 0, correct: Number(v[6]) || 0, count: Number(v[7]) || 0,
        accuracy: Number(v[8]) || 0, timeSec: Number(v[9]) || 0, submittedAt: String(v[14])
      };
      var key = nm + '' + sid;
      var cur = best[key];
      if (!cur || rec.score > cur.score || (rec.score === cur.score && rec.timeSec < cur.timeSec)) best[key] = rec;
    }
    for (var k in best) rows.push(best[k]);
    rows.sort(function (a, b) { return b.score - a.score || a.timeSec - b.timeSec; });
    for (var r = 0; r < rows.length; r++) rows[r].rank = r + 1;
  }
  return jsonp_(p.callback, { ok: true, sheet: name, count: rows.length, rows: rows });
}

/* ============ helpers ============ */
function sanitizeTab_(name) {
  var s = (name == null ? '' : String(name)).trim().replace(/[:\\\/\?\*\[\]]/g, '-');
  if (!s) s = DEFAULT_TAB;
  return s.length > 90 ? s.slice(0, 90) : s;
}
function getTab_(name) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
function str_(v) { return v == null ? '' : String(v); }
function num_(v) { var n = Number(v); return isNaN(n) ? 0 : n; }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function jsonp_(cb, obj) {
  var body = JSON.stringify(obj);
  if (cb) return ContentService.createTextOutput(cb + '(' + body + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
