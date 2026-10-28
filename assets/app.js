/* Agenda País: tooltip del mapa, filtros de acciones, buscador de entidades y Yape. Sin dependencias. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Tooltip de estaciones (el <title> del SVG queda como respaldo y para lectores de pantalla)
  const tip = document.createElement("div"); tip.className = "tip"; tip.hidden = true; document.body.appendChild(tip);
  const mostrar = (el, x, y) => { tip.textContent = el.dataset.t; tip.hidden = false; const w = tip.offsetWidth; tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x + 12)) + "px"; tip.style.top = y + 16 + "px"; };
  // Resalta las conexiones de la estación activa con otros sectores
  const resaltar = (el, on) => {
    const svg = el.closest("svg"), id = el.dataset.id;
    svg.classList.toggle("foco", on);
    $$(".m-con", svg).forEach((p) => p.classList.toggle("on", on && (p.dataset.a === id || p.dataset.b === id)));
  };
  $$(".m-est").forEach((el) => {
    el.addEventListener("mousemove", (ev) => mostrar(el, ev.clientX, ev.clientY));
    el.addEventListener("mouseenter", () => resaltar(el, true));
    el.addEventListener("mouseleave", () => { tip.hidden = true; resaltar(el, false); });
    el.addEventListener("focus", () => { const r = el.getBoundingClientRect(); mostrar(el, r.left, r.bottom - 10); resaltar(el, true); });
    el.addEventListener("blur", () => { tip.hidden = true; resaltar(el, false); });
  });

  // Abrir la acción enlazada desde el mapa u otra página
  const abrir = () => { const d = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (d && d.tagName === "DETAILS") { d.open = true; d.scrollIntoView({ block: "center" }); } };
  addEventListener("hashchange", abrir); abrir();

  // Filtros de acciones (por necesidad de ley)
  $$(".filtros .chip").forEach((b) => (b.onclick = () => {
    $$(".filtros .chip").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    const f = b.dataset.f;
    $$(".acc").forEach((a) => { const ley = a.classList.contains("t-ley") || a.classList.contains("t-reforma_constitucional"); a.hidden = f === "ley" ? !ley : f === "sinley" ? ley : false; });
    $$(".etapa").forEach((h) => { let n = h.nextElementSibling, vis = false; while (n && n.tagName === "DETAILS") { if (!n.hidden) vis = true; n = n.nextElementSibling; } h.hidden = !vis; });
  }));

  // Buscador de entidades
  const q = $("#q-ent");
  if (q) q.addEventListener("input", () => {
    const t = q.value.trim().toLowerCase();
    $$(".ent").forEach((d) => { const ok = !t || d.dataset.q.includes(t) || d.textContent.toLowerCase().includes(t); d.hidden = !ok; });
  });

  // Yape (en línea, sin ventana emergente)
  const yb = $("#yape-btn"), box = $("#yape-box");
  if (yb && box) yb.onclick = () => { box.hidden = !box.hidden; yb.setAttribute("aria-expanded", !box.hidden); };

  // Tema: claro por defecto; el botón alterna y recuerda la elección
  const tb = $("#tema-btn"), raizHTML = document.documentElement;
  const pintarTema = () => { const osc = raizHTML.dataset.theme === "dark"; tb.setAttribute("aria-pressed", osc); tb.title = tb.ariaLabel = osc ? "Modo claro" : "Modo oscuro"; };
  if (tb) { pintarTema(); tb.onclick = () => { const osc = raizHTML.dataset.theme !== "dark"; if (osc) raizHTML.dataset.theme = "dark"; else delete raizHTML.dataset.theme; try { localStorage.setItem("pais_tema", osc ? "dark" : "light"); } catch (_) {} pintarTema(); }; }

  // ---- Asistente: IA en api.tunky.net/pais/chat (el servidor busca en la agenda); si falla, búsqueda local
  const chat = $("#chat"), fab = $("#chat-fab"), log = $("#chat-log");
  if (!chat) return;
  const raiz = chat.dataset.raiz || "";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let IDX = null;
  const indice = () => IDX || (IDX = fetch(raiz + "data/indice.json").then((r) => r.json()).catch(() => []));
  const abrirChat = (on) => { chat.hidden = !on; fab.hidden = on; fab.setAttribute("aria-expanded", on); if (on) { indice(); $("#chat-q").focus(); } };
  fab.onclick = () => abrirChat(true); $("#chat-x").onclick = () => abrirChat(false);
  addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !chat.hidden) abrirChat(false); });
  const add = (cls, h) => { log.insertAdjacentHTML("beforeend", `<div class="msg ${cls}">${h}</div>`); log.scrollTop = log.scrollHeight; };
  const SEC = {};
  const enlace = (id) => SEC[id] ? `<a href="${raiz}s/${SEC[id]}.html#${id}"><b>${id}</b></a>` : `<b>${id}</b>`;
  const enlazar = (t) => esc(String(t).replace(/\b([A-Z]{3})[\u2010-\u2015\u2212](\d{2})\b/g, "$1-$2").replace(/^\s*#{1,6}\s*/gm, "").replace(/^\s*[*-]\s+/gm, "• ")).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\b([A-Z]{3}-\d{2})\b/g, (m) => enlace(m)).replace(/\n/g, "<br>");
  // Búsqueda local (sin IA): palabras del título y del responsable
  const STOP = new Set("que como para por con los las del una uno sus mas hay cual quiero saber sobre esta este agenda propone proponen se hace".split(" "));
  function local(q, L) {
    const ws = norm(q).split(/[^a-z0-9ñ]+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => (w.length > 5 ? w.slice(0, -2) : w));
    const r = L.map((a) => { const t = norm(a.titulo + " " + a.responsable + " " + a.sector); return { a, sc: ws.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0) }; })
      .filter((x) => x.sc).sort((x, y) => y.sc - x.sc).slice(0, 5);
    if (!r.length) return "No encontré una acción sobre eso. Prueba con otras palabras (por ejemplo «anemia», «agua potable», «trámites») o revisa los <a href=\"" + raiz + "index.html#sectores\">sectores</a>.";
    return "Encontré estas acciones relacionadas:<br>" + r.map(({ a }) => `• ${enlace(a.id)} ${esc(a.titulo)} <span class="nota">(${esc(a.etapa)})</span>`).join("<br>");
  }
  const HIST = [];
  async function ia(q) {
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 32000);
      const r = await fetch("https://api.tunky.net/pais/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, hist: HIST.slice(-4) }), signal: ctl.signal });
      clearTimeout(t);
      const j = await r.json();
      return j && j.ok && j.reply ? j.reply : null;
    } catch (_) { return null; }
  }
  const preguntar = async (q) => {
    add("user", esc(q)); $("#chat-sug")?.remove();
    log.insertAdjacentHTML("beforeend", '<div class="msg bot escribiendo" aria-label="Escribiendo"><span></span><span></span><span></span></div>'); log.scrollTop = log.scrollHeight;
    const [resp, L] = await Promise.all([ia(q), indice()]);
    L.forEach((a) => (SEC[a.id] = a.sector));
    log.querySelector(".escribiendo")?.remove();
    if (resp) { add("bot", enlazar(resp)); HIST.push({ r: "u", t: q }, { r: "a", t: resp }); }
    else add("bot", local(q, L));
  };
  $("#chat-f").onsubmit = (ev) => { ev.preventDefault(); const q = $("#chat-q").value.trim(); if (q) { $("#chat-q").value = ""; preguntar(q); } };
  log.addEventListener("click", (ev) => { const b = ev.target.closest("#chat-sug .chip"); if (b) preguntar(b.textContent); });
  if (location.hash === "#chat") abrirChat(true);
})();
