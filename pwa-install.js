/* Khedmain — install banner (bilingual FR / AR) */
(function () {
  'use strict';
  var standalone = window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone === true;
  if (standalone) return;
  try {
    var until = parseInt(localStorage.getItem('kd_pwa_dismissed') || '0', 10);
    if (until && Date.now() < until) return;
    if (localStorage.getItem('kd_pwa_installed') === '1') return;
  } catch (e) {}

  var lang = 'ar';
  try { lang = localStorage.getItem('kd_lang') || 'ar'; } catch (e) {}
  var ar = lang === 'ar';
  var T = {
    text:    ar ? 'ثبّت تطبيق خدمة إن على هاتفك' : 'Installez l’application Khedmain',
    install: ar ? 'تثبيت' : 'Installer',
    how:     ar ? 'كيفاش؟' : 'Voir comment',
    close:   ar ? 'إغلاق' : 'Fermer'
  };

  var css = '' +
  '.kdib{position:fixed;left:10px;right:10px;bottom:10px;z-index:9999;max-width:520px;margin:0 auto;' +
    'background:#141E28;color:#fff;border-radius:16px;box-shadow:0 14px 40px rgba(20,30,40,.35);' +
    'display:flex;align-items:center;gap:12px;padding:10px 12px;' +
    'font-family:-apple-system,Segoe UI,Roboto,"Tajawal",sans-serif;animation:kdibIn .25s ease-out;}' +
  '@keyframes kdibIn{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}' +
  '.kdib img{width:38px;height:38px;border-radius:10px;flex:0 0 auto;}' +
  '.kdib .kdib-t{flex:1;min-width:0;font-weight:700;font-size:14px;line-height:1.3;}' +
  '.kdib .kdib-go{background:#FF7A2F;color:#fff;border:none;border-radius:999px;padding:9px 16px;' +
    'font-weight:800;font-size:14px;cursor:pointer;flex:0 0 auto;font-family:inherit;text-decoration:none;}' +
  '.kdib .kdib-go:active{transform:translateY(1px);}' +
  '.kdib .kdib-x{background:none;border:none;color:rgba(255,255,255,.65);font-size:20px;line-height:1;' +
    'cursor:pointer;flex:0 0 auto;padding:2px 4px;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var bar = document.createElement('div');
  bar.className = 'kdib';
  bar.setAttribute('dir', ar ? 'rtl' : 'ltr');
  bar.innerHTML =
    '<img src="/icon-192.png" alt="Khedmain" />' +
    '<span class="kdib-t">' + T.text + '</span>' +
    '<a class="kdib-go" id="kdibGo" href="/installer.html">' + T.how + '</a>' +
    '<button class="kdib-x" id="kdibX" aria-label="' + T.close + '">&times;</button>';

  function mount() { if (!document.body.contains(bar)) document.body.appendChild(bar); }
  function dismiss() {
    bar.remove();
    try { localStorage.setItem('kd_pwa_dismissed', String(Date.now() + 7 * 24 * 3600 * 1000)); } catch (e) {}
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    var go = bar.querySelector('#kdibGo');
    if (go) {
      go.textContent = T.install;
      go.removeAttribute('href');
      go.addEventListener('click', function (ev) {
        ev.preventDefault();
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; dismiss(); });
      });
    }
  });
  window.addEventListener('appinstalled', function () {
    bar.remove();
    try { localStorage.setItem('kd_pwa_installed', '1'); } catch (e) {}
  });

  function start() {
    mount();
    bar.querySelector('#kdibX').addEventListener('click', dismiss);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
