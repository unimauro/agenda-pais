# Agenda País 2026–2056 — encargo por sector

Repo: /Users/unimauro/Documents/Repos/agenda-pais (sitio cívico, GitHub Pages; hermano de "Agenda Legislativa Tech").
Idea: una hoja de ruta de 30 años para el Perú, sector por sector, que responda a la crítica "más leyes no es mejor país":
cada medida dice si necesita ley o no, qué obra o servicio concreto entrega, quién es responsable, cómo se financia y qué
norma vieja se puede derogar. Horizonte por etapas: 2026–2031, 2031–2036, 2036–2046, 2046–2056. Alineado al Plan
Estratégico de Desarrollo Nacional al 2050 (CEPLAN) y a data/plan2050_comisiones.json (ids válidos para `plan2050`).

## Archivo de salida (uno por sector): data/sectores/<id>.json
{
 "id": "salud", "nombre": "Salud",
 "lema": "≤ 12 palabras, ciudadano",
 "diagnostico": {
   "resumen": "180–280 palabras: dónde estamos, con cifras y su fuente nombrada en el texto",
   "indicadores": [ {"nombre": "…", "valor": "…", "unidad": "…", "anio": 2025, "fuente": "INEI ENDES 2024", "url": "https://…"} ],  // 6–10, REALES y verificados
   "brechas": "Brechas territoriales, por área, lengua, sexo, quintil (con fuente)",
   "causas": ["3–6 causas raíz con evidencia (no opiniones)"]
 },
 "vision_2056": "1–2 frases: cómo se vive en el Perú de 2056 en este sector",
 "metas": [ {"indicador": "…", "linea_base": "valor (año)", "2031": "…", "2036": "…", "2046": "…", "2056": "…",
             "referencia": "promedio OCDE / Chile / meta ODS… (fuente)", "fuente_linea_base": "…"} ],   // 5–8 metas INDICATIVAS
 "acciones": [ {
   "id": "SAL-01", "titulo": "Verbo + qué (≤ 14 palabras)",
   "tipo": "obra | servicio | accion_ejecutiva | ley | derogacion | reforma_constitucional",
   "necesita_ley": "si | parcial | no", "por_que_ley": "Si 'si'/'parcial': reserva de ley concreta. Si 'no': instrumento (DS, RM, programa, Invierte.pe…)",
   "etapa": "2026-2031 | 2031-2036 | 2036-2046 | 2046-2056",
   "que": "60–120 palabras: qué se hace exactamente, dónde y para quién",
   "evidencia": "Por qué funciona: experiencia nacional o internacional evaluada, con fuente",
   "entrega": "Producto tangible (p. ej. '300 centros de salud de primer nivel con resolutividad I-3 en distritos de quintil 1')",
   "responsable": "SIGLA de la entidad ejecutora real",
   "entidades": [ {"sigla": "…", "rol": "rectora|ejecutora|financiadora|supervisora|reguladora|consultiva|beneficiaria"} ],
   "financiamiento": "Fuente existente o realista (presupuesto del pliego, Invierte.pe, OxI, APP, canon, endeudamiento, cooperación) o 'por identificar'",
   "costo_referencial": "Solo con base explícita (supuestos + fuente); si no: 'no estimado'",
   "indicador": "Métrica verificable",
   "deroga_o_simplifica": [ {"norma": "Norma REAL vigente", "motivo": "…"} ],   // [] si no aplica; nunca inventes
   "depende_de": ["ids de otras acciones del mismo u otro sector, o ids tech como 'TAL-06'"],
   "riesgo": "Principal riesgo de que no cambie nada (captura, capacidad, financiamiento, conflicto…)",
   "fuentes": [ {"titulo": "…", "url": "https://…"} ]
 } ],                                                   // 18–28 acciones; ≤ 35 % deben ser 'ley'
 "articulacion": [ {"con": "educacion", "como": "Cómo se conecta con otro sector (anemia ↔ aprendizajes, etc.)"} ],
 "conexion_tech": ["ids de Agenda Legislativa Tech relacionados (p. ej. TAL-06, TAL-07, CON-13)"],
 "plan2050": ["ids"],
 "fuentes": [ {"titulo": "…", "url": "https://…"} ]
}

## Insumos opcionales (solo lectura, datos públicos ya procesados en otro repo de Carlos)
- data/pedn_estructura.json (en este repo): objetivos nacionales, específicos y las 162 Acciones Estratégicas del PEDN 2050 de CEPLAN.
  Agrega a cada acción el campo opcional "pedn": ["AE…"] con 1–2 códigos de AE que la acción contribuye a cumplir.
- /Users/unimauro/Documents/Repos/plan-peru-2050/data/: programas_presupuestales.json (91 PP MEF 2026, PIM y devengado),
  desarticulacion.json (matriz de articulación de 25 políticas nacionales, PESEM y PDRC con el PEDN), cartera_proyectos.json
  (100 proyectos estratégicos propuestos), fisco_sectores.json (recaudación SUNAT por actividad), benchmark_internacional.json,
  ley_32743.json y delegacion_facultades.json (delegación de facultades al Ejecutivo, oct-2026). Úsalos citando su fuente original.

## Reglas
- Evidencia primero: INEI (ENDES, ENAHO, censos), MINSA/REUNIS, SUSALUD, MINEDU (ESCALE, ENLA/ECE), MEF (Consulta Amigable),
  CEPLAN, BCRP, Defensoría, Contraloría, OCDE, Banco Mundial, OMS/OPS, UNESCO, BID, CEPAL. Verifica cifras y URLs en la web;
  si no puedes, dilo ("por verificar") o descríbelo cualitativamente. Nunca inventes cifras, normas ni costos.
- Mezcla realista de instrumentos: la mayoría de las acciones deben ser obra, servicio o acción ejecutiva; las leyes solo cuando
  hay reserva de ley. Incluye al menos 2 derogaciones o simplificaciones reales, si existen.
- Las leyes de iniciativa congresal no pueden crear gasto (art. 79 de la Constitución) ni organismos: dilo cuando aplique.
- Sé honesto sobre los trade-offs y los costos. No menciones políticos ni partidos. No acuses a personas.
- Español peruano claro, para ciudadanos. Son PROPUESTAS ciudadanas, no un plan oficial.
- Escribe el archivo INCREMENTALMENTE (reescríbelo completo cada ~5 acciones) y valida con python3 -m json.tool.
- Solo escribe tu archivo. No hagas git.
- Al terminar responde en ≤ 8 líneas: n.º de acciones por tipo, cuántas necesitan ley, las 3 acciones más transformadoras y
  las cifras que no pudiste verificar.
