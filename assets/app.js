/* Agenda País: tooltip del mapa, filtros de acciones, copiar enlace, buscador global, entidades y Yape. Sin dependencias. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const TIPOS = { obra: "Obra", servicio: "Servicio", accion_ejecutiva: "Acción del Ejecutivo", ley: "Ley", derogacion: "Derogación", reforma_constitucional: "Reforma constitucional" };
  const LEY = { si: "Necesita ley", no: "No necesita ley", parcial: "Ley en parte" };
  const tactil = matchMedia("(pointer: coarse)").matches;
  // Raíz del sitio (las páginas de sector viven en s/)
  const raiz = ($("#chat") && $("#chat").dataset.raiz) || (location.pathname.includes("/s/") ? "../" : "");
  let IDX = null;
  const indice = () => IDX || (IDX = fetch(raiz + "data/indice.json").then((r) => r.json()).catch(() => []));

  // ---- Mapa: tooltip (la etiqueta vive en aria-label; también sirve a lectores de pantalla)
  const tip = document.createElement("div"); tip.className = "tip"; tip.hidden = true; tip.setAttribute("aria-hidden", "true"); document.body.appendChild(tip);
  const ETQ = {};
  $$(".m-est").forEach((el) => (ETQ[el.dataset.id] = el.getAttribute("aria-label")));
  const mostrar = (texto, x, y, extra) => {
    tip.innerHTML = esc(texto) + (extra ? `<small>${esc(extra)}</small>` : ""); tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x + 12)) + "px";
    tip.style.top = (y + 16 + h > innerHeight ? y - h - 12 : y + 16) + "px";
  };
  const ocultar = () => { tip.hidden = true; };
  // Resalta las conexiones de la estación activa con otros sectores
  const resaltar = (el, on) => {
    const svg = el.closest("svg"), id = el.dataset.id;
    svg.classList.toggle("foco", on);
    $$(".m-con", svg).forEach((p) => p.classList.toggle("on", on && (p.dataset.a === id || p.dataset.b === id)));
  };
  let activa = null;
  const desactivar = () => { if (activa) { activa.classList.remove("activa"); resaltar(activa, false); activa = null; } ocultar(); };
  $$(".m-est").forEach((el) => {
    const etq = () => ETQ[el.dataset.id];
    el.addEventListener("mousemove", (ev) => { if (!tactil) mostrar(etq(), ev.clientX, ev.clientY); });
    el.addEventListener("mouseenter", () => { if (!tactil) resaltar(el, true); });
    el.addEventListener("mouseleave", () => { if (!tactil) { ocultar(); resaltar(el, false); } });
    el.addEventListener("focus", () => { const r = el.getBoundingClientRect(); mostrar(etq(), r.left, r.bottom - 10); resaltar(el, true); });
    el.addEventListener("blur", () => { ocultar(); resaltar(el, false); });
    // En pantallas táctiles el primer toque muestra la etiqueta; el segundo abre la acción
    el.addEventListener("click", (ev) => {
      if (!tactil || activa === el) return;
      ev.preventDefault(); desactivar();
      activa = el; el.classList.add("activa"); resaltar(el, true);
      const r = el.getBoundingClientRect(); mostrar(etq(), r.left + r.width / 2 - 100, r.bottom, "Toca otra vez para abrir");
    });
  });
  if (tactil) document.addEventListener("touchstart", (ev) => { if (!ev.target.closest(".m-est")) desactivar(); }, { passive: true });

  // Pista de desplazamiento y sombra de los rótulos fijos cuando el mapa es más ancho que la pantalla
  $$(".mapa-wrap").forEach((w) => {
    const sc = $(".mapa-scroll", w), pista = $(".m-pista", w);
    const revisar = () => { const cabe = sc.scrollWidth <= sc.clientWidth + 2; if (pista) pista.hidden = cabe || sc.scrollLeft > 40; w.classList.toggle("lado", sc.scrollLeft > 2); };
    sc.addEventListener("scroll", revisar, { passive: true }); addEventListener("resize", revisar); revisar();
    if (pista) pista.hidden = sc.scrollWidth <= sc.clientWidth + 2;
  });

  // Puntos del balance (portada): título al pasar y clic para abrir la acción
  const estacion = (id) => $$(".m-est").find((x) => x.dataset.id === id);
  $$(".pt[data-id]").forEach((p) => {
    p.addEventListener("mousemove", (ev) => { const t = ETQ[p.dataset.id]; if (t) mostrar(t, ev.clientX, ev.clientY); });
    p.addEventListener("mouseleave", ocultar);
    p.addEventListener("click", () => { const a = estacion(p.dataset.id); if (a) location.href = a.getAttribute("href"); });
  });

  // Abrir la acción enlazada desde el mapa u otra página
  const abrir = () => { const d = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (d && d.tagName === "DETAILS") { d.open = true; d.scrollIntoView({ block: "center" }); } };
  addEventListener("hashchange", abrir); abrir();

  // ---- Filtros de acciones (ley × tipo × etapa), combinables
  const F = { ley: "", tipo: "", etapa: "" }, filtroN = $(".filtro-n");
  const aplicar = () => {
    let vis = 0, tot = 0;
    $$(".acc").forEach((a) => {
      const ley = a.classList.contains("t-ley") || a.classList.contains("t-reforma_constitucional");
      const tipo = [...a.classList].find((c) => c.startsWith("t-")).slice(2);
      const ok = (F.ley === "ley" ? ley : F.ley === "sinley" ? !ley : true) && (!F.tipo || tipo === F.tipo) && (!F.etapa || a.dataset.et === F.etapa);
      a.hidden = !ok; tot++; if (ok) vis++;
    });
    $$(".etapa").forEach((h) => { let n = h.nextElementSibling, v = false; while (n && n.tagName === "DETAILS") { if (!n.hidden) v = true; n = n.nextElementSibling; } h.hidden = !v; });
    if (filtroN) filtroN.textContent = vis === tot ? "" : vis ? `Mostrando ${vis} de ${tot} acciones.` : "Ninguna acción cumple esos filtros.";
  };
  $$(".filtros .chip").forEach((b) => (b.onclick = () => {
    const g = b.dataset.g;
    $$(`.filtros .chip[data-g="${g}"]`).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    F[g] = b.dataset.f; aplicar();
  }));

  // Copiar enlace directo a una acción (si el portapapeles falla, el enlace funciona como ancla normal)
  document.addEventListener("click", (ev) => {
    const c = ev.target.closest(".copiar"); if (!c || !navigator.clipboard) return;
    ev.preventDefault();
    const url = location.origin + location.pathname + c.getAttribute("href"), txt = c.textContent;
    navigator.clipboard.writeText(url).then(() => { c.textContent = "Enlace copiado"; c.classList.add("ok"); history.replaceState(null, "", c.getAttribute("href")); setTimeout(() => { c.textContent = txt; c.classList.remove("ok"); }, 2000); })
      .catch(() => { location.hash = c.getAttribute("href"); });
  });

  // ---- Entidades: título de cada acción desde el índice y buscador
  const ents = $("#ents");
  if (ents) {
    indice().then((L) => {
      const T = {}; L.forEach((a) => (T[a.id] = a.titulo));
      $$("li > a", ents).forEach((a) => { const t = T[a.textContent.trim()]; if (t && !a.nextElementSibling.classList.contains("t")) a.insertAdjacentHTML("afterend", `<span class="t">${esc(t)}</span>`); });
    });
    const q = $("#q-ent");
    if (q) q.addEventListener("input", () => {
      const t = norm(q.value.trim());
      $$(".ent").forEach((d) => { const ok = !t || d.dataset.q.includes(t) || norm(d.textContent).includes(t); d.hidden = !ok; });
    });
    // Abrir la entidad enlazada (#MEF)
    const ab = () => { const d = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (d && d.classList.contains("ent")) d.open = true; };
    addEventListener("hashchange", ab); ab();
  }

  // ---- Buscador global (buscar.html): filtra data/indice.json en el navegador; la URL guarda los filtros
  const busca = $("#busca");
  if (busca) {
    const res = $("#b-res"), n = $("#b-n"), campos = ["q", "sector", "tipo", "etapa", "ley", "resp"];
    const val = (k) => busca.elements[k].value.trim();
    const marcar = (t, ws) => { let h = esc(t); ws.forEach((w) => { if (w.length > 2) h = h.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>"); }); return h; };
    const correr = async () => {
      const L = await indice(), v = Object.fromEntries(campos.map((k) => [k, val(k)]));
      const ws = norm(v.q).split(/[^a-z0-9ñ]+/).filter(Boolean), rv = norm(v.resp);
      const r = L.filter((a) => (!v.sector || a.sector === v.sector) && (!v.tipo || a.tipo === v.tipo) && (!v.etapa || a.etapa === v.etapa) && (!v.ley || a.necesita_ley === v.ley)
        && (!rv || norm(a.responsable).includes(rv) || (a.ents || []).some((x) => norm(x).includes(rv)))
        && ws.every((w) => norm(a.id + " " + a.titulo + " " + a.responsable + " " + a.sector).includes(w)));
      const alguno = campos.some((k) => v[k]);
      const p = new URLSearchParams(); campos.forEach((k) => { if (v[k]) p.set(k, v[k]); });
      history.replaceState(null, "", location.pathname + (alguno ? "?" + p : ""));
      res.innerHTML = r.slice(0, 200).map((a) => `<li data-c="${esc(a.sector)}"><a href="${raiz}s/${esc(a.sector)}.html#${esc(a.id)}">${esc(a.id)}</a><span class="rt">${marcar(a.titulo, v.q.split(/\s+/))}</span>`
        + `<span class="rm">${esc(TIPOS[a.tipo] || a.tipo)} · ${esc(a.etapa.replace("-", "–"))} · ${esc(LEY[a.necesita_ley] || "")} · ${esc(a.responsable || "")}</span></li>`).join("");
      n.textContent = !alguno ? `${L.length} acciones. Escribe o elige un filtro.` : r.length ? `${r.length} ${r.length === 1 ? "acción" : "acciones"}${r.length > 200 ? " (se muestran 200)" : ""}.` : "Ninguna acción coincide. Prueba con menos filtros u otras palabras.";
    };
    let t; const luego = () => { clearTimeout(t); t = setTimeout(correr, 150); };
    busca.addEventListener("submit", (ev) => { ev.preventDefault(); correr(); });
    busca.addEventListener("input", luego); busca.addEventListener("change", luego);
    busca.addEventListener("reset", () => setTimeout(correr, 0));
    const p = new URLSearchParams(location.search);
    campos.forEach((k) => { if (p.get(k)) busca.elements[k].value = p.get(k); });
    correr();
  }

  // Yape (en línea, sin ventana emergente)
  const yb = $("#yape-btn"), box = $("#yape-box");
  if (yb && box) yb.onclick = () => { box.hidden = !box.hidden; yb.setAttribute("aria-expanded", !box.hidden); };

  // Tema: claro por defecto; el botón alterna y recuerda la elección
  const tb = $("#tema-btn"), raizHTML = document.documentElement;
  const pintarTema = () => { const osc = raizHTML.dataset.theme === "dark"; tb.setAttribute("aria-pressed", osc); tb.title = tb.ariaLabel = osc ? "Modo claro" : "Modo oscuro"; const m = $('meta[name="theme-color"]'); if (m) m.content = osc ? "#142029" : "#f1f4f3"; };
  if (tb) { pintarTema(); tb.onclick = () => { const osc = raizHTML.dataset.theme !== "dark"; if (osc) raizHTML.dataset.theme = "dark"; else delete raizHTML.dataset.theme; try { localStorage.setItem("pais_tema", osc ? "dark" : "light"); } catch (_) {} pintarTema(); }; }

  // ---- Asistente: IA en api.tunky.net/pais/chat (el servidor busca en la agenda); si falla, búsqueda local
  const chat = $("#chat"), fab = $("#chat-fab"), log = $("#chat-log");
  if (!chat) return;
  const abrirChat = (on) => { chat.hidden = !on; fab.hidden = on; fab.setAttribute("aria-expanded", on); if (on) { indice(); $("#chat-q").focus(); } else fab.focus(); };
  fab.onclick = () => abrirChat(true); $("#chat-x").onclick = () => abrirChat(false);
  addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !chat.hidden) abrirChat(false); });
  const add = (cls, h) => { log.insertAdjacentHTML("beforeend", `<div class="msg ${cls}">${h}</div>`); log.scrollTop = log.scrollHeight; };
  const SEC = {};
  const enlace = (id) => SEC[id] ? `<a href="${raiz}s/${SEC[id]}.html#${id}"><b>${id}</b></a>` : `<b>${id}</b>`;
  const enlazar = (t) => esc(String(t).replace(/\b([A-Z]{3})[‐-―−](\d{2})\b/g, "$1-$2").replace(/^\s*#{1,6}\s*/gm, "").replace(/^\s*[*-]\s+/gm, "• ")).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\b([A-Z]{3}-\d{2})\b/g, (m) => enlace(m)).replace(/\n/g, "<br>");
  // Búsqueda local (sin IA): palabras del título y del responsable
  const STOP = new Set("que como para por con los las del una uno sus mas hay cual quiero saber sobre esta este agenda propone proponen se hace".split(" "));
  function local(q, L) {
    const ws = norm(q).split(/[^a-z0-9ñ]+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => (w.length > 5 ? w.slice(0, -2) : w));
    const r = L.map((a) => { const t = norm(a.titulo + " " + a.responsable + " " + a.sector); return { a, sc: ws.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0) }; })
      .filter((x) => x.sc).sort((x, y) => y.sc - x.sc).slice(0, 5);
    const mas = `<br><a href="${raiz}buscar.html?q=${encodeURIComponent(q)}">Buscar «${esc(q)}» con filtros</a>`;
    if (!r.length) return "No encontré una acción sobre eso. Prueba con otras palabras (por ejemplo «anemia», «agua potable», «trámites») o revisa los <a href=\"" + raiz + "index.html#sectores\">sectores</a>." + mas;
    return "Encontré estas acciones relacionadas:<br>" + r.map(({ a }) => `• ${enlace(a.id)} ${esc(a.titulo)} <span class="nota">(${esc(a.etapa)})</span>`).join("<br>") + mas;
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
