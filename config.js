/* =====================================================================
   CONFIG CENTRAL — Luz & Brito Advocacia
   Usado pela LP (index.html) e pela página de redirecionamento (redirect.html).
   Nada foi inventado: campos null ficam ocultos ou "em configuração".
   ===================================================================== */
window.CONFIG = {
  brand: { name: "Luz & Brito Advocacia", city: "Conceição do Araguaia/PA", address: null, oab: null, email: null },
  whatsapp: {
    number: null,          // só dígitos: 55 + DDD + número, ex.: "5594900000000"
    appendRef: true        // adiciona código de origem (UTM/seção) ao fim da mensagem
  },
  supabase: {              // projeto "ADS BR CLIENTES" — visitas e leads com site="luz-brito" (painel em /dashboard)
    url: "https://qxhnjzyhtllmtdrcyygi.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aG5qenlodGxsbXRkcmN5eWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzczNjgsImV4cCI6MjA5NzgxMzM2OH0.DWf4I_x9F--H7ZZHUt_n4V3B__Nlsf1jNZdUV0vNBLU",
    site: "luz-brito"
  },
  crmWebhook: null,        // endpoint do CRM/agente (POST JSON com nome, whatsapp, assunto, UTMs)
  metaPixelId: null,       // ID do Meta Pixel — PageView nas duas páginas, Lead só no /redirect
  googleTagId: null,       // tag global, ex.: "AW-XXXXXXXXX" (carrega nas duas páginas)
  googleAdsConversion: null, // send_to da conversão, ex.: "AW-XXXXXXXXX/AbCdEfGh" — dispara só no /redirect
  redirectSeconds: 3,
  team: [
    { name: "Dr. Lucas Pereira da Luz", role: "Advogado", oab: null, photo: null, show: true },
    { name: null, role: "Advogado", oab: null, photo: null, show: false } // sócio: preencher e show:true
  ]
};

window.MESSAGES = {
  geral:        { label: "Orientação sobre benefício do INSS", text: "Olá! Gostaria de orientação sobre um benefício do INSS." },
  bpc:          { label: "BPC/LOAS",               text: "Olá! Gostaria de informações sobre BPC/LOAS." },
  zika:         { label: "Pensão do Zika",         text: "Olá! Gostaria de entender se minha família pode ter direito à pensão especial do Zika." },
  rural:        { label: "Aposentadoria rural",    text: "Olá! Tenho dúvidas sobre aposentadoria rural." },
  incapacidade: { label: "Afastamento por doença", text: "Olá! Estou com dificuldade para trabalhar por doença ou lesão e gostaria de orientação." },
  urbana:       { label: "Aposentadoria urbana",   text: "Olá! Tenho dúvidas sobre minha aposentadoria." },
  negado:       { label: "Benefício negado",       text: "Olá! Meu benefício foi negado pelo INSS e gostaria de orientação." }
};

/* Utilitários compartilhados: UTMs persistidas na sessão + carregamento das tags */
window.LB = (function () {
  var store = null; try { store = window.sessionStorage; } catch (e) {}
  var params = new URLSearchParams(location.search);
  var utm = {};
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid"].forEach(function (k) {
    var v = params.get(k) || (store && store.getItem("lb_" + k));
    if (v) { utm[k] = v; try { store && store.setItem("lb_" + k, v); } catch (e) {} }
  });
  window.dataLayer = window.dataLayer || [];
  var C = window.CONFIG;
  if (C.metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", C.metaPixelId); fbq("track", "PageView");
  }
  if (C.googleTagId) {
    var g = document.createElement("script"); g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + C.googleTagId; document.head.appendChild(g);
    window.gtag = function () { dataLayer.push(arguments); }; gtag("js", new Date()); gtag("config", C.googleTagId);
  }
  function refCode(src) {
    var s = utm.utm_source || (utm.fbclid ? "meta" : utm.gclid ? "google" : "site");
    return "Ref: " + (src || "lp") + " · " + s.slice(0, 12) + (utm.utm_campaign ? " · " + utm.utm_campaign.slice(0, 24) : "");
  }
  function waLink(key, nome, src) {
    if (!C.whatsapp.number) return null;
    var m = (window.MESSAGES[key] || window.MESSAGES.geral).text;
    if (nome) m += "\nMeu nome é " + nome + ".";
    if (C.whatsapp.appendRef) m += "\n\n" + refCode(src);
    return "https://wa.me/" + C.whatsapp.number + "?text=" + encodeURIComponent(m);
  }
  function origem() {
    var o = "";
    if (utm.utm_source) o = utm.utm_source + (utm.utm_campaign ? " / " + utm.utm_campaign : "");
    else if (utm.gclid || params.get("gbraid") || params.get("wbraid")) o = "google-ads";
    else if (utm.fbclid) o = "meta";
    else if (document.referrer && document.referrer.indexOf(location.hostname) < 0) { try { o = new URL(document.referrer).hostname; } catch (e) {} }
    if (o) { try { store && store.setItem("lb_origem", o.slice(0, 120)); } catch (e) {} }
    return (store && store.getItem("lb_origem")) || o || "direto";
  }
  function sbInsert(table, row) {
    var sb = C.supabase;
    // sem gravação no preview do Claude (o CSP bloqueia hosts externos); grava no domínio real
    if (!sb || !sb.url || /claude/.test(location.hostname)) return Promise.resolve({ ok: true });
    return fetch(sb.url + "/rest/v1/" + table, { method: "POST", keepalive: true,
      headers: { apikey: sb.anonKey, Authorization: "Bearer " + sb.anonKey, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row) });
  }
  return { utm: utm, store: store, waLink: waLink, origem: origem, sbInsert: sbInsert };
})();
