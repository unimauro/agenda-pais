// pais.js — Asistente de la "Agenda País 2026–2056" (api.tunky.net/pais/chat). Sin base de datos ni datos personales.
// Recupera acciones, sectores y paquetes de derogación desde data/chat.json (GitHub Pages) y llama al gateway ai.tunky.net.
// Seguridad: CORS del server (ALLOW_ORIGINS), rate-limit por IP (hash con sal), tope diario, cuerpo acotado con 413.
const crypto = require("crypto");

module.exports = function makePais({ json: jsonBase }) {
  const json = (res, code, obj) => { res.setHeader("X-Content-Type-Options", "nosniff"); res.setHeader("Cache-Control", "no-store"); jsonBase(res, code, obj); };
  const AI_TOKEN = process.env.PAIS_AI_TOKEN || process.env.AGENDA_AI_TOKEN || "";
  const AI_URL = process.env.PAIS_AI_URL || process.env.AGENDA_AI_URL || "https://ai.tunky.net/v1/chat";
  const AI_MODEL = process.env.PAIS_AI_MODEL || process.env.AGENDA_AI_MODEL || "openai/gpt-oss-20b:free";
  const AI_DIA = +(process.env.PAIS_AI_MAX_DIA || 800);
  const PROYECTOS = ["agenda-pais", "agenda-tech"]; // si el gateway no conoce "agenda-pais", reintenta con el proyecto ya registrado
  const DATOS_URL = "https://unimauro.github.io/agenda-pais/data/chat.json";
  const SAL = crypto.randomBytes(16).toString("hex"); // solo en memoria: el hash de IP no sobrevive reinicios
  const ipOf = (req) => (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "?";
  const hashIp = (ip) => crypto.createHash("sha256").update(SAL + ip).digest("hex").slice(0, 24);
  const txt = (s, n) => String(s == null ? "" : s).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F]/g, "").trim().slice(0, n);
  const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const RL = new Map();
  function limitado(key, max, win) {
    const now = Date.now(), arr = (RL.get(key) || []).filter((t) => now - t < win);
    arr.push(now); RL.set(key, arr); return arr.length > max;
  }
  setInterval(() => { const now = Date.now(); for (const [k, a] of RL) { const f = a.filter((t) => now - t < 3600e3); f.length ? RL.set(k, f) : RL.delete(k); } }, 600e3).unref();

  function cuerpo(req, res, lim) {
    return new Promise((ok) => {
      let buf = "", grande = false;
      req.on("data", (c) => { if (grande) return; buf += c; if (buf.length > lim) { grande = true; buf = ""; } });
      req.on("end", () => {
        if (grande) { json(res, 413, { ok: false, error: "Contenido demasiado grande." }); return ok(null); }
        try { const o = JSON.parse(buf); if (!o || typeof o !== "object" || Array.isArray(o)) throw 0; ok(o); } catch { json(res, 400, { ok: false, error: "Datos inválidos." }); ok(null); }
      });
      req.on("error", () => { json(res, 400, { ok: false, error: "Datos inválidos." }); ok(null); });
    });
  }

  // ---- base de conocimiento (caché 30 min) ----
  let D = null, dT = 0;
  async function datos() {
    if (D && Date.now() - dT < 30 * 60e3) return D;
    try {
      const d = await (await fetch(DATOS_URL, { signal: AbortSignal.timeout(10000) })).json();
      const sec = Object.fromEntries(d.sectores.map((s) => [s.id, s]));
      D = {
        sec,
        acc: d.acciones.map((a) => ({ ...a, _t: norm(a.titulo), _s: norm([a.que, a.entrega, a.responsable, a.indicador, sec[a.sector] && sec[a.sector].nombre].join(" ")) })),
        sectores: d.sectores.map((s) => ({ ...s, _t: norm([s.id, s.nombre, s.lema].join(" ")) })),
        paq: d.paquetes.map((p) => ({ ...p, _t: norm(p.nombre + " " + p.objeto) })),
      };
      dT = Date.now();
    } catch (e) {}
    return D;
  }
  const STOP = new Set("de la el los las y o a en que con por para del un una se su sus es al lo como mas sobre hay cual cuales me mi te tu le les esta este estas estos ley leyes propuesta propuestas proponen propone quien quienes cuanto algo tema dime quiero saber hola gracias pais peru agenda hace hacer".split(" "));
  const SIN = { posta: ["salud", "primer nivel"], hospital: ["salud"], medico: ["salud"], colegio: ["escuela", "educacion"], profesor: ["docente"], hijos: ["escuela", "infancia"],
    agua: ["saneamiento"], desague: ["saneamiento"], luz: ["electric", "energia"], robo: ["delito", "seguridad", "polic"], extorsion: ["crimen", "seguridad"], insegur: ["seguridad", "polic"],
    chamba: ["empleo", "formal"], trabajo: ["empleo", "formal"], materias: ["productiv", "diversific", "industri"], primas: ["productiv", "diversific", "industri"], exportar: ["export", "productiv"],
    derogar: ["deroga"], tramite: ["simplific", "tramite"], burocracia: ["simplific", "estado"], corrupcion: ["integridad", "control"], casa: ["vivienda"], pistas: ["transporte", "vial"],
    campo: ["agro", "agric"], chacra: ["agro", "agric"], pension: ["proteccion", "pension"], anemia: ["anemia", "nutric"], mineria: ["miner"], clima: ["ambiente", "climat"] };
  function recuperar(d, q) {
    const nq = norm(q);
    const ws = nq.split(/[^a-z0-9ñ]+/).filter((w) => w.length > 2 && !STOP.has(w)).flatMap((w) => [w, ...(SIN[w] || [])]).map((w) => (w.length > 5 ? w.slice(0, -2) : w));
    const ids = (q.toUpperCase().match(/\b[A-Z]{3}-\d{2}\b/g) || []);
    const sc = (t, s) => ws.reduce((n, w) => n + (t.includes(w) ? 6 : 0) + (s && s.includes(w) ? 2 : 0), 0);
    const derog = /derog|limpi|normas inutiles/.test(nq);
    let acc = d.acc.map((a) => ({ a, sc: sc(a._t, a._s) + (derog && a.tipo === "Derogación" ? 8 : 0) })).filter((x) => x.sc >= 4).sort((x, y) => y.sc - x.sc).map((x) => x.a);
    if (/sin (una )?ley|no necesita ley|sin norma/.test(nq)) acc = acc.filter((a) => a.ley === "no").concat(d.acc.filter((a) => a.ley === "no" && !acc.includes(a)));
    acc = [...d.acc.filter((a) => ids.includes(a.id)), ...acc.filter((a) => !ids.includes(a.id))].slice(0, 6);
    const sectores = derog ? [] : d.sectores.map((s) => ({ s, sc: sc(s._t) })).filter((x) => x.sc).sort((x, y) => y.sc - x.sc).map((x) => x.s).slice(0, 2);
    if (!derog) acc.forEach((a) => { const s = d.sec[a.sector]; if (s && sectores.length < 2 && !sectores.includes(s)) sectores.push(s); });
    const paq = /derog|limpi|simplific|beneficio|exonera|tramite|normas/.test(nq) ? d.paq.map((p) => ({ p, sc: sc(p._t) })).sort((x, y) => y.sc - x.sc).map((x) => x.p).slice(0, 3) : [];
    return { acc, sectores, paq };
  }
  const fichaA = (a, d) => [`[${a.id}] ${a.titulo} (${(d.sec[a.sector] || {}).nombre || a.sector}; ${a.tipo}; etapa ${a.etapa}; ${a.ley === "no" ? "no necesita ley" : "necesita ley"})`,
    a.que && `Qué es: ${a.que}`, a.entrega && `Qué entrega: ${a.entrega}`, a.responsable && `Responsable: ${a.responsable}`,
    a.costo && `Costo referencial: ${a.costo}`, a.fin && `Financiamiento: ${a.fin}`, a.indicador && `Cómo se mide: ${a.indicador}`].filter(Boolean).join("\n");
  const fichaS = (s) => [`SECTOR ${s.nombre}: ${s.lema || ""}`, s.resumen && `Situación: ${s.resumen}`, s.vision && `Visión 2056: ${s.vision}`, (s.metas || []).length && `Metas: ${s.metas.join("; ")}`].filter(Boolean).join("\n");
  const fichaP = (p) => `PAQUETE DE LIMPIEZA NORMATIVA "${p.nombre}" (${p.n} normas; ${p.instrumento}): ${p.objeto}`;

  async function llamarIA(messages, model, proyecto, ms) {
    const r = await fetch(AI_URL, { method: "POST", signal: AbortSignal.timeout(ms),
      headers: { "Content-Type": "application/json", "X-Client-Token": AI_TOKEN, Origin: "https://unimauro.github.io" },
      body: JSON.stringify(model ? { project: proyecto, messages, model } : { project: proyecto, messages }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.reply) throw new Error("gateway " + r.status);
    return j.reply;
  }
  let usoDia = { d: "", n: 0 };

  return {
    "POST /pais/chat": async (req, res) => {
      if (!AI_TOKEN) return json(res, 503, { ok: false, error: "Asistente con IA no configurado." });
      if (limitado("ip:" + hashIp(ipOf(req)), 12, 10 * 60e3)) return json(res, 429, { ok: false, error: "Muchas preguntas seguidas; espera unos minutos." });
      const hoy = new Date().toISOString().slice(0, 10);
      if (usoDia.d !== hoy) usoDia = { d: hoy, n: 0 };
      if (usoDia.n >= AI_DIA) return json(res, 503, { ok: false, error: "El asistente alcanzó su límite de hoy." });
      const b = await cuerpo(req, res, 6000); if (!b) return;
      const q = txt(b.q, 400);
      if (q.length < 2) return json(res, 400, { ok: false, error: "Escribe tu pregunta." });
      const hist = (Array.isArray(b.hist) ? b.hist : []).slice(-4).map((m) => (m && m.r === "a" ? "Asistente: " : "Ciudadano: ") + txt(m && m.t, 500)).join("\n");
      const d = await datos();
      if (!d) return json(res, 503, { ok: false, error: "El asistente no pudo cargar la agenda." });
      const r = recuperar(d, q + " " + hist.slice(-300));
      const notas = [...r.sectores.map(fichaS), ...r.acc.map((a) => fichaA(a, d)), ...r.paq.map(fichaP)];
      const contenido = `NOTAS INTERNAS para responder (nunca digas "notas", "fichas", "fuentes" ni "contexto": habla como si lo supieras tú; si la respuesta no está en ellas, dilo con honestidad y sugiere revisar los sectores):\n\n` +
        `${notas.length ? notas.join("\n\n") : "(la agenda no tiene una acción sobre esto)"}\n\n` +
        (hist ? `LO QUE YA HABLARON:\n${hist}\n\n` : "") +
        `QUÉ ES ESTO: Agenda País 2026–2056, una propuesta ciudadana independiente (no un plan oficial) de acciones por sector para los próximos 30 años, alineada al Plan Perú 2050; la mayoría de acciones no necesitan una ley nueva sino ejecución, y hay paquetes para derogar normas inútiles.\n` +
        `CÓMO RESPONDER: como una persona cercana que conversa, en español peruano sencillo, tuteando. Empieza conectando con lo que la persona vive o necesita. ` +
        `De 3 a 5 frases cortas, sin tablas, títulos ni listas largas. Menciona el código de la acción (ej. SAL-01) de forma natural. ` +
        `Si sirve, di qué cambiaría en su vida, quién se encargaría, para qué etapa y si necesita ley o no. No nombres ni culpes a personas o políticos. Termina con una pregunta corta o una sugerencia útil.\n\n` +
        `LO QUE PREGUNTA LA PERSONA: ${q}`;
      usoDia.n++;
      let reply = null;
      for (const [model, proy, ms] of [[AI_MODEL, PROYECTOS[0], 15000], [null, PROYECTOS[0], 12000], [AI_MODEL, PROYECTOS[1], 12000]]) {
        try { reply = await llamarIA([{ role: "user", content: contenido }], model, proy, ms); break; } catch (e) {}
      }
      if (!reply) return json(res, 502, { ok: false, error: "El asistente no respondió." });
      return json(res, 200, { ok: true, reply: txt(reply, 2500), ids: r.acc.map((a) => a.id) });
    },
  };
};
