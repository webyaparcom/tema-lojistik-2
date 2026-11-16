/* randevu-formu-2 — Hızlı Randevu Formu (1 Kas 2026, T1-B varyant).
   Yer tutucular: rf2head rf2hizmet rf2saatler rf2kvkk rf2btn rf2ikon rf2kapali rf2disabled rf2veri. Gönderim randevu-formu ile aynı sunucusuz yol: submit=whatsapp → wa.me hazır mesaj, submit=mailto → mailto:. phone/email boşsa setting.
   Ortak yardımcılar: esc t guvenliHref gorselYol evet sayi metinleriYaz (desing metinleri kaçışlı). */
var D = json.desing || {};
var L = json.lang || "tr";

/* HTML kaçışı — html'e giden her değer bundan geçer */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
/* Dil seçimi: aktif dil → tr → en → ilk anahtar (motorun wmPickLang'i) */
function t(v) { return wmPickLang(v, L); }
/* Bağlantı: dış/mailto/tel/# aynen; iç sayfa adı → dil önekli yol; javascript: vb. reddedilir */
function guvenliHref(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s) || s.charAt(0) === "/") { return s; }
  return wxLangInternalHref(s);
}
/* Görsel yolu: "/" ve http(s) aynen; yalın ad → /img/<ad>; tehlikeli şema → "" */
function gorselYol(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (s.charAt(0) === "/" || /^https?:\/\//i.test(s)) { return s; }
  return "/img/" + s;
}
function evet(v, d) {
  if (v === undefined || v === null || v === "") { return d; }
  return !(v === false || v === "false" || v === 0 || v === "0");
}
function sayi(v, d, mn, mx) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) { n = d; }
  return Math.min(mx, Math.max(mn, n));
}
/* desing'deki düz metin / {tr,en,ar} değerlerini {{anahtar}} yerine KAÇIŞLI yazar.
   Motor aynı yer tutucuyu ham yazardı; back.js önce davrandığı için kaçışsız değer html'e ulaşmaz. */
function metinleriYaz() {
  var k;
  for (k in D) {
    if (!Object.prototype.hasOwnProperty.call(D, k)) { continue; }
    var v = D[k];
    if (v == null) { continue; }
    var dilli = typeof v === "object" && !Array.isArray(v) && (typeof v.tr === "string" || typeof v.en === "string");
    if (typeof v === "object" && !dilli) { continue; }
    var deger = esc(t(v));
    var desen = new RegExp("\\{\\{" + String(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\}\\}", "g");
    html = html.replace(desen, function () { return deger; });
  }
}

var rf2Set = (webmakerdata && webmakerdata.setting) || {};
var rf2Submit = D.submit === "mailto" ? "mailto" : "whatsapp";
var rf2Phone = String(D.phone || "").trim() || (typeof rf2Set.phone === "string" ? rf2Set.phone.trim() : "");
var rf2Email = String(D.email || "").trim() || (typeof rf2Set.email === "string" ? rf2Set.email.trim() : "");
var rf2Hedef = rf2Submit === "mailto" ? rf2Email : rf2Phone;

/* Saat çipleri: hours.start → hours.end, slot dakikada bir */
function rf2Dk(s, d) { var m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "")); return m ? Number(m[1]) * 60 + Number(m[2]) : d; }
function rf2Hm(dk) { var h = Math.floor(dk / 60); var m = dk % 60; return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m; }
var rf2H = D.hours || {};
var rf2Bas = rf2Dk(rf2H.start, 540);
var rf2Son = rf2Dk(rf2H.end, 1080);
var rf2Slot = sayi(rf2H.slot, 30, 5, 240);
var rf2Saatler = "";
var rf2k;
var rf2Say = 0;
for (rf2k = rf2Bas; rf2k + rf2Slot <= rf2Son && rf2Say < 48; rf2k += rf2Slot) {
  var hm = rf2Hm(rf2k);
  rf2Saatler += '<label class="modulex-rf2-cip"><input type="radio" name="saat" value="' + hm + '" /><span dir="ltr">' + hm + "</span></label>";
  rf2Say++;
}
var rf2Gunler = [];
var rf2Gs = Array.isArray(rf2H.days) && rf2H.days.length ? rf2H.days : [1, 2, 3, 4, 5];
for (rf2k = 0; rf2k < rf2Gs.length; rf2k++) { var g = Number(rf2Gs[rf2k]); if (g >= 1 && g <= 7) { rf2Gunler.push(g); } }

/* Hizmet seçenekleri */
var rf2Svc = Array.isArray(D.services) ? D.services : [];
var rf2Opts = "";
for (rf2k = 0; rf2k < rf2Svc.length; rf2k++) {
  var s = rf2Svc[rf2k] || {};
  var ad = t(s.name);
  if (ad) { rf2Opts += '<option value="' + esc(ad) + '">' + esc(ad) + "</option>"; }
}
var rf2SvcHtml = rf2Opts
  ? '<label class="modulex-rf2-alan"><span class="modulex-rf2-etiket">' + esc(t(D.serviceLabel)) + ' <span aria-hidden="true">*</span></span>' +
    '<select name="hizmet" required><option value="">' + esc(t(D.servicePick)) + "</option>" + rf2Opts + "</select></label>"
  : "";

var rf2KvUrl = guvenliHref(D.kvkkUrl);
var rf2Kvkk = esc(t(D.kvkkText)) + (rf2KvUrl ? ' <a href="' + esc(rf2KvUrl) + '" target="_blank" rel="noopener">' + esc(t(D.kvkkLink)) + "</a>" : "");

var rf2Veri = JSON.stringify({
  submit: rf2Submit,
  hedef: rf2Hedef,
  lead: sayi(D.leadDays, 1, 0, 365),
  max: sayi(D.maxDays, 60, 1, 730),
  gunler: rf2Gunler,
  sablon: t(D.msgTemplate),
  konu: t(D.subject),
  m: { zorunlu: t(D.required), tel: t(D.phoneInvalid), kapali: t(D.dayClosed), tamam: t(D.successText) }
}).replace(/</g, "\\u003c");

html = html.replace(/\{\{rf2head\}\}/g, function () {
  return (t(D.title) ? '<h2 class="modulex-rf2-title">' + esc(t(D.title)) + "</h2>" : "") + (t(D.description) ? '<p class="modulex-rf2-desc">' + esc(t(D.description)) + "</p>" : "");
});
html = html.replace(/\{\{rf2hizmet\}\}/g, function () { return rf2SvcHtml; });
html = html.replace(/\{\{rf2saatler\}\}/g, function () { return rf2Saatler; });
html = html.replace(/\{\{rf2kvkk\}\}/g, function () { return rf2Kvkk; });
html = html.replace(/\{\{rf2btn\}\}/g, function () { return esc(t(rf2Submit === "mailto" ? D.submitMailto : D.submitWhatsapp)); });
html = html.replace(/\{\{rf2ikon\}\}/g, function () { return rf2Submit === "mailto" ? "mail" : "chat"; });
html = html.replace(/\{\{rf2kapali\}\}/g, function () { return rf2Hedef ? "" : '<p class="modulex-rf2-kapali" role="status">' + esc(t(D.closedText)) + "</p>"; });
html = html.replace(/\{\{rf2disabled\}\}/g, function () { return rf2Hedef ? "" : " disabled"; });
html = html.replace(/\{\{rf2veri\}\}/g, function () { return rf2Veri; });
metinleriYaz();
