"""Genera el sitio estático de Agenda País 2026–2056 a partir de data/sectores/*.json.

Salidas: index.html (mapa de metro de los sectores), s/<sector>.html, entidades.html, metodo.html, privacidad.html,
data/indice.json (liviano), sitemap.xml y og.png (si hay rsvg-convert).
Uso: python3 scripts/build.py
"""
import html
import json
import re
import shutil
import subprocess
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://unimauro.github.io/agenda-pais/"
TECH = "https://unimauro.github.io/agenda-legislativa-tech/"
GA = "G-YKRRVYDYQ8"

# Orden y color de cada línea del mapa (los sectores aún no escritos simplemente no aparecen)
SECTORES = [
    ("salud", "Salud", "#0b8a6a"), ("educacion", "Educación", "#d48a00"), ("digital", "Digital", "#3b5bdb"),
    ("agua", "Agua y saneamiento", "#1585b5"), ("energia", "Energía", "#e8590c"), ("mineria", "Minería", "#8a6a55"),
    ("transporte", "Transporte", "#7048e8"), ("seguridad", "Seguridad y justicia", "#c2255c"),
    ("economia", "Economía y empleo", "#2b8a3e"), ("agro", "Agro y alimentación", "#74a812"),
    ("ambiente", "Ambiente y clima", "#0c8599"), ("estado", "Estado e integridad", "#5c677d"),
    ("vivienda", "Vivienda y ciudades", "#d6336c"), ("proteccion", "Protección social", "#9c36b5"),
]
ETAPAS = ["2026-2031", "2031-2036", "2036-2046", "2046-2056"]
TIPOS = {"obra": "Obra", "servicio": "Servicio", "accion_ejecutiva": "Acción del Ejecutivo", "ley": "Ley",
         "derogacion": "Derogación", "reforma_constitucional": "Reforma constitucional"}
LEY = {"ley", "reforma_constitucional"}

e = lambda s: html.escape(str(s if s is not None else ""), quote=True)


def url_ok(u):
    return isinstance(u, str) and re.match(r"^https?://", u) is not None


def enlace(texto, url):
    return f'<a href="{e(url)}" target="_blank" rel="noopener">{e(texto)}</a>' if url_ok(url) else e(texto)


def glifo(tipo, cx, cy, color, r=7):
    """Estación del mapa: anillo = necesita ley; punto = obra/servicio/acción ejecutiva; anillo tachado = derogación."""
    if tipo in LEY:
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="var(--papel)" stroke="{color}" stroke-width="3.5"/>'
    if tipo == "derogacion":
        d = r * 0.7
        return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="var(--papel)" stroke="{color}" stroke-width="3"/>'
                f'<line x1="{cx-d}" y1="{cy+d}" x2="{cx+d}" y2="{cy-d}" stroke="{color}" stroke-width="2.5"/>')
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}" stroke="var(--papel)" stroke-width="2"/>'


def cargar():
    secs = []
    for sid, nombre, color in SECTORES:
        f = ROOT / f"data/sectores/{sid}.json"
        if not f.exists():
            continue
        d = json.loads(f.read_text())
        d["id"], d["color"], d["nombre_corto"] = sid, color, nombre
        d.setdefault("nombre", nombre)
        for a in d.get("acciones", []):
            if a.get("etapa") not in ETAPAS:
                a["etapa"] = ETAPAS[0]
        secs.append(d)
    return secs


# ---------------------------------------------------------------- plantilla
def shell(titulo, desc, cuerpo, raiz="", ruta=""):
    return f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(titulo)}</title>
<meta name="description" content="{e(desc)}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="{SITE}{ruta}">
<meta property="og:type" content="website"><meta property="og:title" content="{e(titulo)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{SITE}og.png"><meta property="og:url" content="{SITE}{ruta}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{raiz}favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="{raiz}apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<link rel="stylesheet" href="{raiz}assets/style.css"><link rel="stylesheet" href="{raiz}assets/sectores.css">
<script src="{raiz}assets/consent.js" defer></script><script src="{raiz}assets/app.js" defer></script>
</head><body>
<a class="saltar" href="#main">Saltar al contenido</a>
<header class="top"><a class="marca" href="{raiz}index.html"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 22h24M4 12h24" stroke="#0b8a6a" stroke-width="4"/><path d="M4 22C14 22 18 12 28 12" stroke="#d48a00" stroke-width="4" fill="none"/><circle cx="16" cy="17" r="5" fill="var(--papel)" stroke="var(--tinta)" stroke-width="3"/></svg>Agenda País</a>
<nav aria-label="Principal"><a href="{raiz}index.html#mapa">Mapa</a><a href="{raiz}index.html#sectores">Sectores</a><a href="{raiz}entidades.html">Entidades</a><a href="{raiz}metodo.html">Método</a></nav></header>
<main id="main">{cuerpo}</main>
<footer class="pie"><div class="pie-in">
<p><b>Agenda País 2026–2056</b> es una propuesta ciudadana independiente, no un plan oficial. Hecha por
<a href="https://unimauro.github.io/" target="_blank" rel="noopener">Carlos Cárdenas</a> con un equipo de agentes de IA especializados y revisión humana pendiente.
El contenido se puede reutilizar citando la fuente.</p>
<p class="apoyo"><a class="b-cafe" href="https://buymeacoffee.com/unimauro" target="_blank" rel="noopener">Invítame un café</a>
<button class="b-yape" id="yape-btn" aria-expanded="false" aria-controls="yape-box">Yápeame</button>
<a class="b-paypal" href="https://paypal.me/unimauro" target="_blank" rel="noopener">PayPal</a></p>
<div class="yape" id="yape-box" hidden><b>Yape: Carlos Cárdenas Fernández</b><img src="{raiz}assets/yape.png" alt="Código QR de Yape" loading="lazy" width="200" height="200"></div>
<p class="otros">Otros proyectos: <a href="{TECH}" target="_blank" rel="noopener">Agenda Legislativa Tech</a>,
<a href="https://unimauro.github.io/congreso-abierto-peru/" target="_blank" rel="noopener">Congreso Abierto</a>,
<a href="https://unimauro.github.io/productividad/" target="_blank" rel="noopener">Productividad</a>,
<a href="https://planperu2050.pe/" target="_blank" rel="noopener">Plan Perú 2050</a>,
<a href="https://unimauro.github.io/" target="_blank" rel="noopener">más</a>. <a href="{raiz}privacidad.html">Privacidad</a></p>
</div></footer></body></html>"""


# ---------------------------------------------------------------- mapa de metro
def mapa(secs, raiz="", solo=None):
    """SVG del mapa: una línea por sector, estaciones por etapa y conexiones entre sectores (depende_de)."""
    secs = [s for s in secs if solo is None or s["id"] == solo]
    x0, alto, paso = 168, 64, 30
    maxi = [max([sum(1 for a in s.get("acciones", []) if a["etapa"] == et) for s in secs] or [0]) for et in ETAPAS]
    anchos = [max(150, paso * (m + 1)) for m in maxi]
    xs = [x0 + sum(anchos[:i]) for i in range(len(ETAPAS))]
    W = x0 + sum(anchos) + 30
    H = 70 + alto * len(secs)
    pos, partes = {}, []
    # rejilla de etapas
    for i, et in enumerate(ETAPAS):
        x = xs[i]
        partes.append(f'<rect x="{x}" y="34" width="{anchos[i]}" height="{H-40}" class="m-etapa{i % 2}"/>')
        partes.append(f'<text x="{x+6}" y="24" class="m-anio">{et[:4]}</text>')
    partes.append(f'<text x="{x0 + sum(anchos) - 6}" y="24" class="m-anio" text-anchor="end">2056</text>')
    # posiciones de estaciones
    for j, s in enumerate(secs):
        y = 66 + j * alto
        s["_y"] = y
        por_et = defaultdict(list)
        for a in s.get("acciones", []):
            por_et[a["etapa"]].append(a)
        for i, et in enumerate(ETAPAS):
            L = por_et[et]
            for k, a in enumerate(L):
                pos[a["id"]] = (xs[i] + (k + 1) * anchos[i] / (len(L) + 1), y, s, a)
    # conexiones entre sectores (debajo de las líneas)
    con = []
    for aid, (x, y, s, a) in pos.items():
        for dep in a.get("depende_de") or []:
            if dep in pos and pos[dep][2]["id"] != s["id"]:
                x2, y2 = pos[dep][0], pos[dep][1]
                con.append(f'<path d="M{x2:.0f} {y2} C{x2:.0f} {(y2+y)/2:.0f} {x:.0f} {(y2+y)/2:.0f} {x:.0f} {y}" class="m-con"/>')
    partes += con
    for s in secs:
        y = s["_y"]
        partes.append(f'<line x1="{x0-8}" y1="{y}" x2="{W-24}" y2="{y}" stroke="{s["color"]}" stroke-width="7" stroke-linecap="round"/>')
        partes.append(f'<a href="{raiz}s/{s["id"]}.html"><rect x="6" y="{y-15}" width="{x0-24}" height="30" rx="15" fill="{s["color"]}"/>'
                      f'<text x="{6 + (x0-24)/2}" y="{y+5}" class="m-sec" text-anchor="middle">{e(s["nombre_corto"])}</text></a>')
    for aid, (x, y, s, a) in pos.items():
        etq = f'{a["id"]}: {a.get("titulo","")} ({TIPOS.get(a.get("tipo"), a.get("tipo"))})'
        partes.append(f'<a href="{raiz}s/{s["id"]}.html#{e(aid)}" class="m-est" data-t="{e(etq)}" aria-label="{e(etq)}">'
                      f'{glifo(a.get("tipo"), round(x, 1), y, s["color"])}<title>{e(etq)}</title></a>')
    return (f'<div class="mapa-scroll"><svg class="mapa" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" '
            f'aria-label="Mapa de las acciones por sector y etapa, 2026 a 2056">{"".join(partes)}</svg></div>')


def leyenda():
    return ('<ul class="leyenda"><li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="var(--tinta)"/></svg>'
            'Obra, servicio o acción del Ejecutivo: no necesita ley</li>'
            '<li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.5" fill="none" stroke="var(--tinta)" stroke-width="3"/></svg>Necesita ley</li>'
            '<li><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.5" fill="none" stroke="var(--tinta)" stroke-width="2.5"/><line x1="5" y1="15" x2="15" y2="5" stroke="var(--tinta)" stroke-width="2.2"/></svg>Derogación</li>'
            '<li><svg viewBox="0 0 30 20"><path d="M2 16C10 16 20 4 28 4" fill="none" stroke="var(--gris)" stroke-width="2" stroke-dasharray="3 3"/></svg>Depende de otro sector</li></ul>')


# ---------------------------------------------------------------- páginas
def balance(secs):
    acc = [a for s in secs for a in s.get("acciones", [])]
    n = len(acc) or 1
    cnt = defaultdict(int)
    for a in acc:
        cnt[a.get("tipo")] += 1
    ley = sum(cnt[t] for t in LEY)
    puntos = "".join(
        f'<span class="pt t-{e(a.get("tipo"))}" data-c="{s["id"]}" title="{e(a["id"])}: {e(a.get("titulo"))}"></span>'
        for s in secs for a in sorted(s.get("acciones", []), key=lambda a: a.get("tipo") in LEY))
    filas = "".join(f'<li><b>{cnt[t]}</b> {e(nom.lower() if t != "accion_ejecutiva" else "acciones del Ejecutivo")}</li>'
                    for t, nom in TIPOS.items() if cnt[t])
    return (f'<section class="bloque" id="balance"><h2>¿Más leyes? No: más obra</h2>'
            f'<p class="intro">De {len(acc)} acciones, solo <b>{ley}</b> ({round(100*ley/n)} %) necesitan una ley. El resto se puede '
            f'hacer con presupuesto, gestión y decisiones del Ejecutivo que ya existen. Cada punto es una acción.</p>'
            f'<div class="puntos" aria-hidden="true">{puntos}</div><ul class="cuenta">{filas}</ul></section>')


def index(secs):
    total = sum(len(s.get("acciones", [])) for s in secs)
    filas = "".join(
        f'<li data-c="{s["id"]}"><a href="s/{s["id"]}.html"><span class="linea"></span><span class="sn">{e(s["nombre"])}</span>'
        f'<span class="sl">{e(s.get("lema",""))}</span><span class="sc">{len(s.get("acciones", []))} acciones</span></a></li>'
        for s in secs)
    faltan = [n for sid, n, _ in SECTORES if sid not in {s["id"] for s in secs}]
    pend = f'<p class="nota">En preparación: {e(", ".join(faltan))}.</p>' if faltan else ""
    cuerpo = f"""
<section class="hero"><h1>Agenda País<span>2026–2056</span></h1>
<p class="bajada">Treinta años, sector por sector: qué construir, qué servicio mejorar, quién responde y qué ley sí hace falta.
{total} acciones con evidencia, responsables y fuentes.</p></section>
<section class="bloque" id="mapa"><h2 class="vh">Mapa de acciones</h2>{leyenda()}{mapa(secs)}<p class="nota">Toca una estación para ver la acción. Las curvas grises unen acciones que dependen de otro sector.</p></section>
{balance(secs)}
<section class="bloque" id="sectores"><h2>Sectores</h2><ul class="sectores">{filas}</ul>{pend}</section>"""
    return shell("Agenda País 2026–2056", f"Hoja de ruta ciudadana a 30 años para el Perú: {total} acciones por sector con responsables, financiamiento y qué necesita ley.", cuerpo)


def sector(s, secs):
    d = s.get("diagnostico", {})
    ind = "".join(f'<li><span class="iv">{e(valor(i)[0])}<small>{e(i.get("unidad",""))}</small></span>{('<span class="ivn">' + e(valor(i)[1]) + '</span>') if valor(i)[1] else ''}<span class="in">{e(i.get("nombre"))}</span>'
                  f'<span class="if">{enlace(str(i.get("fuente","")) + (" " + str(i.get("anio")) if i.get("anio") else ""), i.get("url"))}</span></li>'
                  for i in d.get("indicadores", []))
    causas = "".join(f"<li>{e(c)}</li>" for c in d.get("causas", []))
    metas = "".join(f'<tr><th scope="row">{e(m.get("indicador"))}<small>{e(m.get("referencia",""))}</small></th><td>{e(m.get("linea_base"))}</td>'
                    + "".join(f'<td>{e(m.get(y, ""))}</td>' for y in ("2031", "2036", "2046", "2056")) + "</tr>" for m in s.get("metas", []))
    nombres = {x["id"]: x for x in secs}
    ids_todas = {a["id"]: x["id"] for x in secs for a in x.get("acciones", [])}

    def dep(i):
        if i in ids_todas:
            return f'<a href="{"" if ids_todas[i] == s["id"] else ids_todas[i] + ".html"}#{e(i)}">{e(i)}</a>'
        if re.match(r"^(IA|CIB|GOB|CON|ECO|TAL|SOB|DER)-\d{2}$", i):
            return f'<a href="{TECH}p/{i}.html" target="_blank" rel="noopener">{e(i)} (Agenda Tech)</a>'
        return e(i)

    def accion(a):
        ents = ", ".join(f'<a href="../entidades.html#{e(x.get("sigla"))}">{e(x.get("sigla"))}</a> ({e(x.get("rol"))})' for x in a.get("entidades", []))
        der = "".join(f'<li>{e(x.get("norma"))}: {e(x.get("motivo"))}</li>' for x in a.get("deroga_o_simplifica", []))
        fu = ", ".join(enlace(x.get("titulo"), x.get("url")) for x in a.get("fuentes", []))
        agr = a.get("agrupa") or []
        agr_html = ("<dt>Agrupa</dt><dd>" + ", ".join(dep(i) for i in agr) + "</dd>") if agr else ""
        deps = ", ".join(dep(i) for i in a.get("depende_de") or [])
        ley = a.get("necesita_ley")
        return f"""<details class="acc t-{e(a.get('tipo'))}" id="{e(a['id'])}" data-c="{s['id']}">
<summary>{glifo_html(a.get('tipo'), s['color'])}<span class="aid">{e(a['id'])}</span><span class="at">{e(a.get('titulo'))}</span><span class="atipo">{e(TIPOS.get(a.get('tipo'), a.get('tipo')))}</span></summary>
<div class="acc-in"><p>{e(a.get('que'))}</p>
<dl><dt>Qué se entrega</dt><dd>{e(a.get('entrega'))}</dd>
<dt>¿Necesita ley?</dt><dd><b>{e({'si':'Sí','no':'No','parcial':'En parte'}.get(ley, ley))}</b>. {e(a.get('por_que_ley'))}</dd>
<dt>Responsable</dt><dd>{e(a.get('responsable'))}{(' · con ' + ents) if ents else ''}</dd>
<dt>Financiamiento</dt><dd>{e(a.get('financiamiento'))}</dd><dt>Costo referencial</dt><dd>{e(a.get('costo_referencial'))}</dd>
<dt>Indicador</dt><dd>{e(a.get('indicador'))}</dd><dt>Evidencia</dt><dd>{e(a.get('evidencia'))}</dd>
<dt>Riesgo</dt><dd>{e(a.get('riesgo'))}</dd>{agr_html}{('<dt>Depende de</dt><dd>' + deps + '</dd>') if deps else ''}
{('<dt>Deroga o simplifica</dt><dd><ul>' + der + '</ul></dd>') if der else ''}{('<dt>Fuentes</dt><dd>' + fu + '</dd>') if fu else ''}</dl></div></details>"""

    grupos = ""
    for et in ETAPAS:
        L = [a for a in s.get("acciones", []) if a["etapa"] == et]
        if L:
            grupos += f'<h3 class="etapa">{et.replace("-", "–")}</h3>' + "".join(accion(a) for a in L)
    art = "".join(f'<li><a href="{x.get("con")}.html">{e(nombres[x["con"]]["nombre"])}</a>: {e(x.get("como"))}</li>' if x.get("con") in nombres
                  else f'<li><b>{e(x.get("con"))}</b>: {e(x.get("como"))}</li>' for x in s.get("articulacion", []))
    tech = ", ".join(dep(i) for i in s.get("conexion_tech", []))
    fuentes = "".join(f"<li>{enlace(x.get('titulo'), x.get('url'))}</li>" for x in s.get("fuentes", []))
    bal = s.get("balance_regulatorio")
    bal_html = ""
    if bal:
        nl = bal.get("necesita_ley", {})
        bal_html = (f'<section class="bloque"><h2>De {e(bal.get("propuestas_originales"))} leyes a {len(s.get("acciones", []))} acciones</h2>'
                    f'<p class="intro">Las propuestas de Agenda Legislativa Tech se consolidaron en {e(bal.get("leyes_marco"))} leyes marco, '
                    f'{e(bal.get("paquetes_ejecutivos"))} paquetes del Ejecutivo y {e(bal.get("obras"))} obras o servicios. De las originales, '
                    f'{e(nl.get("no"))} no necesitaban ley y {e(nl.get("parcial"))} solo en parte.</p><p>{e(bal.get("nota",""))}</p></section>')
    n = len(s.get("acciones", []))
    nley = sum(1 for a in s.get("acciones", []) if a.get("tipo") in LEY)
    cuerpo = f"""
<section class="s-head" data-c="{s['id']}"><p class="migas"><a href="../index.html#sectores">Sectores</a></p><h1>{e(s['nombre'])}</h1>
<p class="bajada">{e(s.get('lema'))}</p><p class="s-n">{n} acciones, {nley} necesitan ley</p></section>
<nav class="s-nav" aria-label="En esta página"><a href="#hoy">Dónde estamos</a><a href="#vision">A dónde vamos</a><a href="#acciones">Qué hacer</a><a href="#conexiones">Conexiones</a></nav>
<section class="bloque" id="hoy"><h2>Dónde estamos</h2><div class="prosa">{parrafos(d.get('resumen'))}</div>
<ul class="indicadores">{ind}</ul>
{('<h3>Brechas</h3><div class="prosa">' + parrafos(d.get('brechas')) + '</div>') if d.get('brechas') else ''}
{('<h3>Causas de fondo</h3><ul class="prosa">' + causas + '</ul>') if causas else ''}</section>
<section class="bloque" id="vision"><h2>A dónde vamos</h2><blockquote class="vision">{e(s.get('vision_2056'))}</blockquote>
<div class="tabla-scroll"><table class="metas"><caption>Metas indicativas</caption><thead><tr><th scope="col">Indicador</th><th scope="col">Hoy</th><th scope="col">2031</th><th scope="col">2036</th><th scope="col">2046</th><th scope="col">2056</th></tr></thead><tbody>{metas}</tbody></table></div></section>
{bal_html}
<section class="bloque" id="acciones"><h2>Qué hacer</h2>{leyenda()}{mapa(secs, '../', solo=s['id'])}
<div class="filtros" role="group" aria-label="Filtrar acciones"><button class="chip on" data-f="todas" aria-pressed="true">Todas</button><button class="chip" data-f="sinley" aria-pressed="false">No necesitan ley</button><button class="chip" data-f="ley" aria-pressed="false">Leyes</button></div>
<div class="acciones">{grupos}</div></section>
<section class="bloque" id="conexiones"><h2>Con qué se conecta</h2><ul class="prosa">{art}</ul>
{('<p>En Agenda Legislativa Tech: ' + tech + '</p>') if tech else ''}</section>
<section class="bloque fuentes"><h2>Fuentes</h2><ol>{fuentes}</ol></section>"""
    return shell(f"{s['nombre']}: Agenda País 2026–2056", f"{s['nombre']} al 2056: {s.get('lema','')}. {n} acciones con responsables y fuentes.", cuerpo, "../", f"s/{s['id']}.html")


def valor(i):
    """Separa el número de su aclaración: '29,5 (por verificar…)' → ('29,5', 'por verificar…')."""
    v = str(i.get("valor", ""))
    m = re.match(r"^\s*([^()]+?)\s*\((.+)\)\s*$", v)
    return (m.group(1), m.group(2)) if m else (v, "")


def parrafos(t, n=3):
    """Parte un texto largo en párrafos de ~n oraciones."""
    ors = re.split(r"(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÑ¿])", str(t or ""))
    return "".join(f"<p>{e(' '.join(ors[k:k+n]))}</p>" for k in range(0, len(ors), n))


def glifo_html(tipo, color):
    return f'<svg class="g" viewBox="0 0 20 20" aria-hidden="true">{glifo(tipo, 10, 10, color, 6.5)}</svg>'


def entidades(secs):
    por = defaultdict(list)
    for s in secs:
        for a in s.get("acciones", []):
            vistos = set()
            for x in [{"sigla": a.get("responsable"), "rol": "responsable"}] + (a.get("entidades") or []):
                sg = (x.get("sigla") or "").strip()
                if sg and sg != "—" and sg not in vistos:
                    vistos.add(sg)
                    por[sg].append((s, a, x.get("rol")))
    filas = ""
    for sg in sorted(por, key=lambda k: (-len(por[k]), k)):
        items = "".join(f'<li><a href="s/{s["id"]}.html#{e(a["id"])}" data-c="{s["id"]}"><span class="dot"></span>{e(a["id"])}</a> {e(a.get("titulo"))} <span class="rol">{e(r)}</span></li>'
                        for s, a, r in por[sg])
        filas += f'<details class="ent" id="{e(sg)}" data-q="{e(sg.lower())}"><summary><b>{e(sg)}</b><span>{len(por[sg])} acciones</span></summary><ul>{items}</ul></details>'
    cuerpo = f"""<section class="s-head" data-c="tinta"><h1>Entidades</h1><p class="bajada">Qué le toca a cada entidad del Estado en esta agenda, para que se le pueda pedir cuentas.</p></section>
<section class="bloque"><label class="buscar">Busca una entidad<input id="q-ent" type="search" placeholder="MINSA, MINEDU, gobiernos regionales…" autocomplete="off"></label>
<p class="nota">{len(por)} entidades. El responsable es quien ejecuta; las demás participan con el rol indicado.</p><div id="ents">{filas}</div></section>"""
    return shell("Entidades: Agenda País 2026–2056", "Qué le toca a cada entidad del Estado peruano en la Agenda País 2026–2056.", cuerpo, "", "entidades.html")


def metodo(secs):
    cuerpo = f"""<section class="s-head" data-c="tinta"><h1>Método</h1><p class="bajada">Cómo se hizo y qué no es.</p></section>
<section class="bloque prosa"><h2>Qué es</h2><p>Una propuesta ciudadana de hoja de ruta a 30 años. No es un plan oficial ni compromete a ninguna entidad. Se alinea al
Plan Estratégico de Desarrollo Nacional al 2050 y responde a una crítica justa: más leyes no hacen un mejor país. Por eso cada acción dice si de verdad necesita
una ley o si basta con presupuesto, gestión y decisiones que ya puede tomar el Ejecutivo.</p>
<h2>Cómo se hizo</h2><p>Un equipo de agentes de IA, uno por sector, redactó diagnóstico, metas y acciones con fuentes oficiales (INEI, MINSA, MINEDU, MEF, CEPLAN, BCRP)
e internacionales (OCDE, Banco Mundial, OMS, UNESCO). Cada acción trae su evidencia, entidad responsable, financiamiento, indicador y riesgo.
Las cifras sin verificar se marcan como tales. El sector Digital consolida las 128 propuestas de
<a href="{TECH}">Agenda Legislativa Tech</a> en leyes marco, paquetes del Ejecutivo y obras.</p>
<h2>Límites</h2><p>Las metas son indicativas. Los costos solo se muestran cuando hay una base explícita. Falta revisión humana experta, sector por sector:
si encuentras un error, escríbelo a <a href="https://www.linkedin.com/in/unimauro/" target="_blank" rel="noopener">Carlos Cárdenas</a>.</p>
<h2>Datos abiertos</h2><p>Todo está en JSON: <a href="data/indice.json">índice</a> y un archivo por sector en <code>data/sectores/</code>.</p></section>"""
    return shell("Método: Agenda País 2026–2056", "Cómo se construyó la Agenda País 2026–2056 y cuáles son sus límites.", cuerpo, "", "metodo.html")


def privacidad():
    cuerpo = """<section class="s-head" data-c="tinta"><h1>Privacidad</h1></section><section class="bloque prosa">
<p>Este sitio no pide datos personales. Solo si aceptas, carga Google Analytics con IP anonimizada para saber qué sectores interesan más
(Ley 29733). Puedes cambiar tu decisión borrando los datos del sitio en tu navegador.</p></section>"""
    return shell("Privacidad: Agenda País", "Política de privacidad de Agenda País.", cuerpo, "", "privacidad.html")


def main():
    secs = cargar()
    (ROOT / "s").mkdir(exist_ok=True)
    # Color de cada sector como variable CSS (la CSP no permite estilos en línea)
    (ROOT / "assets/sectores.css").write_text('[data-c="tinta"]{--c:var(--tinta)}\n' + "".join(f'[data-c="{sid}"]{{--c:{col}}}\n' for sid, _, col in SECTORES))
    (ROOT / "index.html").write_text(index(secs))
    for s in secs:
        (ROOT / f"s/{s['id']}.html").write_text(sector(s, secs))
    (ROOT / "entidades.html").write_text(entidades(secs))
    (ROOT / "metodo.html").write_text(metodo(secs))
    (ROOT / "privacidad.html").write_text(privacidad())
    indice = [{"id": a["id"], "sector": s["id"], "titulo": a.get("titulo"), "tipo": a.get("tipo"), "etapa": a.get("etapa"),
               "necesita_ley": a.get("necesita_ley"), "responsable": a.get("responsable"), "depende_de": a.get("depende_de", [])}
              for s in secs for a in s.get("acciones", [])]
    (ROOT / "data/indice.json").write_text(json.dumps(indice, ensure_ascii=False, separators=(",", ":")))
    urls = ["", "entidades.html", "metodo.html"] + [f"s/{s['id']}.html" for s in secs]
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                                      + "".join(f"<url><loc>{SITE}{u}</loc></url>" for u in urls) + "</urlset>\n")
    og = ROOT / "og.svg"
    if og.exists() and shutil.which("rsvg-convert"):
        tmp = ROOT / ".og.tmp.svg"
        tmp.write_text(og.read_text().replace("__N__", str(len(indice))).replace("__S__", str(len(secs))))
        subprocess.run(["rsvg-convert", "-w", "1200", "-h", "630", str(tmp), "-o", str(ROOT / "og.png")], check=True)
        tmp.unlink()
    print(f"OK: {len(secs)} sectores, {len(indice)} acciones")


if __name__ == "__main__":
    main()
