/* Agenda País: tooltip del mapa, filtros de acciones, buscador de entidades y Yape. Sin dependencias. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Tooltip de estaciones (el <title> del SVG queda como respaldo y para lectores de pantalla)
  const tip = document.createElement("div"); tip.className = "tip"; tip.hidden = true; document.body.appendChild(tip);
  const mostrar = (el, x, y) => { tip.textContent = el.dataset.t; tip.hidden = false; const w = tip.offsetWidth; tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x + 12)) + "px"; tip.style.top = y + 16 + "px"; };
  $$(".m-est").forEach((el) => {
    el.addEventListener("mousemove", (ev) => mostrar(el, ev.clientX, ev.clientY));
    el.addEventListener("mouseleave", () => (tip.hidden = true));
    el.addEventListener("focus", () => { const r = el.getBoundingClientRect(); mostrar(el, r.left, r.bottom - 10); });
    el.addEventListener("blur", () => (tip.hidden = true));
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
})();
