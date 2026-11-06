# Revisión especializada, ronda 2 (fase 1: solo lectura)

Mismo protocolo que REVISION.md (léelo primero), con cinco roles nuevos. Cada revisor lee TODO lo de su encargo en
`data/sectores/*.json` (14 sectores, 357 acciones) y escribe UN archivo `data/revision/r2-<rol>.json` (lista JSON con el
mismo esquema de REVISION.md: id, archivo, rol, veredicto, resumen, hallazgos[severidad, campo, problema, correccion, fuente]).
No modifica los sectores. Escribe incremental (reescribe completo cada 4-5 elementos). Lee por id con python; no vuelques archivos.

La ronda 1 (data/revision/{constitucional-fiscal,jurista,cifras,seguridad,economia,spij}.json) ya se aplicó: cada acción
tocada tiene `revision_atendida` con la decisión. No repitas un hallazgo que ya figure ahí como "aplicado" o "descartado"
con motivo razonable; sí puedes insistir si el descarte está mal fundado (dilo).

Lectura compacta sugerida (campos que importan a tu rol), p. ej.:
python3 -c "import json;s=json.load(open('data/sectores/salud.json'));[print(a['id'],a['tipo'],a['necesita_ley'],'|',a['titulo'],'|',a['por_que_ley'][:200]) for a in s['acciones']]"

## Roles y qué buscar

### r2-gobtech (gobierno digital y tecnología)
- Toda acción con componente digital (plataformas, registros, historia clínica, identidad, pagos, datos abiertos, IA, sensores,
  interoperabilidad): ¿usa lo que ya existe (PIDE, gob.pe, ID Perú/DNIe, Carpeta Ciudadana, Pago Fácil, GeoPerú, Datos Abiertos,
  SIAF, SIGA, Invierte.pe, SEACE/PERÚ COMPRAS) o crea un sistema nuevo y duplicado? Propón reutilizar.
- Marco legal digital correcto: DL 1412 (gobierno digital) y su reglamento DS 029-2021-PCM, Ley 29733 (datos personales) y su
  reglamento vigente, Ley 31814 (IA), Ley 27269 (firmas), Ley 30096 (delitos informáticos), Ley 31207? (verifica), ciberseguridad.
  Si una acción trata datos sensibles (salud, menores, biométricos, geolocalización) debe decir cómo protege: evaluación de
  impacto, minimización, bases legales.
- Dependencias con Agenda Legislativa Tech: ids citados en depende_de/conexion_tech (TAL-, GOB-, ECO-, CIB-, SOB-, IA-, CON-, DER-)
  deben existir en /Users/unimauro/Documents/Repos/agenda-legislativa-tech/data (busca en nuevas/*.json e indice.json) y ser
  pertinentes; señala los que faltan (acción digital sin su dependencia tech obvia) o sobran.
- Realismo técnico: plazos, costo de software público, lock-in, open source, identidad digital, inclusión digital rural y
  brecha (no asumir conectividad), accesibilidad (WCAG) y lenguas originarias en servicios digitales.

### r2-gestion (gestión pública y ejecución)
- Responsable y entidades: ¿tiene competencia legal esa entidad (LOPE 29158, LOGR 27867, LOM 27972, Ley 27783)? ¿Falta el
  actor que realmente ejecuta (gobierno regional, municipio, PRONIS, PNSU, ARCC/ANIN, Provías, Autoridad Nacional de
  Infraestructura)? Siglas inexistentes o entidades ya absorbidas.
- Financiamiento realista: fuente nombrada y plausible (presupuesto del pliego/PP, Invierte.pe, OxI Ley 29230, APP DL 1362,
  canon, endeudamiento, cooperación, G2G). "por identificar" en acciones de etapa 2026-2031 es hallazgo medio.
- Entrega e indicador: tangibles, medibles, con fecha; no "fortalecer", "promover", "impulsar". Metas por etapa coherentes
  con la línea base y la capacidad de ejecución (ejecución histórica del pliego, obras paralizadas).
- Instrumento correcto: si dice "no necesita ley" indica cuál (DS, RM, programa presupuestal, PP, Invierte.pe) y que ese
  instrumento alcance (p. ej. un DS no puede crear un organismo público: LOPE art. 28-33 exige ley; un programa sí por DS).
- Secuencia: depende_de faltantes evidentes (una obra sin su expediente/estudio, un servicio sin el registro que lo alimenta),
  acciones que debieran fusionarse por ser el mismo producto, y riesgos de ejecución no mencionados (capacidad regional, SERVIR,
  rotación, arbitrajes, consulta previa, saneamiento físico-legal, conflictos sociales).

### r2-constitucional (derecho constitucional y administrativo)
- Art. 79 (iniciativa de gasto del Congreso), art. 74 (legalidad tributaria, Norma VII y DL 1521), art. 106 (leyes orgánicas),
  art. 206 (reforma constitucional: procedimiento y si realmente hace falta), art. 60 (subsidiariedad: empresas públicas solo por ley
  expresa), art. 70 (propiedad/expropiación DL 1192), arts. 188-199 (descentralización: no recentralizar competencias
  transferidas sin ley orgánica), autonomías (BCRP art. 84, universidades art. 18, municipios art. 194, SBS, JNE/ONPE/RENIEC,
  Ministerio Público, Defensoría, Contraloría), art. 104 (delegación) y 118.19 (DU), art. 89 y Convenio 169 (consulta previa,
  Ley 29785), art. 2 (derechos fundamentales: datos, reunión, libertad de empresa art. 59), art. 62 (contratos-ley), art. 139
  (jurisdicción), art. 149 (justicia comunal), bicameralidad (Ley 31988).
- Jurisprudencia del TC cuando sea pertinente (cita expediente solo si lo verificas en tc.gob.pe; si no, "no verificable").
- Coherencia necesita_ley/por_que_ley/tipo: "no" cuando sí hay reserva de ley (o al revés), reforma constitucional disfrazada
  de ley, ley que invade reglamento, DS que invade reserva de ley, ley declarativa inútil.
- Derogaciones (deroga_o_simplifica): que la norma exista, esté vigente y la derogación no deje vacío (p. ej. sustento de
  expropiaciones en curso).

### r2-ddhh (derechos humanos y enfoque de derechos)
- Estándares: Constitución, Convención Americana y Corte IDH, PIDESC, CDN (niñez), CDPD y Ley 29973 (discapacidad), Convenio 169
  y Ley 29785 (pueblos indígenas), Ley 29735 (lenguas originarias), Ley 30364 (violencia contra mujeres), Ley 30490 (adulto
  mayor), Ley 29733 (datos), Ley 32? de migración (verifica), Reglas Mandela (cárceles), PIDCP (debido proceso, prisión preventiva).
- Busca: medidas punitivas o de "mano dura" que choquen con proporcionalidad, debido proceso o uso de la fuerza (sobre todo
  SEG-, MIN-, PRO-); vigilancia masiva, biometría y perfilamiento sin garantías (DIG-, SEG-, EST-); omisión de grupos (pueblos
  indígenas, discapacidad, mujeres, niñez, LGTBI, migrantes, personas privadas de libertad, adultos mayores, población rural y
  amazónica); lenguaje estigmatizante; condicionamientos de derechos (p. ej. negar servicios por informalidad); acceso a
  servicios en lengua originaria y accesibilidad; derecho al agua (art. 7-A), salud, educación, vivienda, trabajo digno,
  ambiente sano; participación y consulta; reparaciones; no regresividad de DESC.
- Señala también lo que FALTA: una acción con fuerte impacto en derechos que debería incluir salvaguardas, indicador
  desagregado (sexo, área, lengua, discapacidad, quintil) o mecanismo de queja. Propón el texto concreto.

### r2-economia (economía y finanzas públicas)
- Sostenibilidad fiscal: suma de costos por etapa vs. espacio fiscal (regla fiscal vigente, presión tributaria ~15 % del PBI,
  deuda); acciones que crean gasto permanente sin fuente; costos "no estimado" en acciones grandes de 2026-2031 (pide una
  estimación con base o una banda).
- Incentivos y distorsiones: subsidios, exoneraciones, precios regulados, empresas públicas, barreras a la competencia (INDECOPI),
  rigideces laborales, informalidad (que la medida no la premie), captura regulatoria, riesgo moral, economía política.
- Evidencia de impacto: ¿hay evaluación (MEF, JPAL, BID, Banco Mundial, OCDE, CEPAL) que respalde? Si la evidencia citada es
  débil o contraria, dilo y propón alternativa con mejor costo-efectividad.
- Cifras macro y precios: BCRP, MEF (MMM 2026-2029), SUNAT, INEI; verifica las que puedas; marca "(por verificar)" si no.
- Trade-offs honestos: quién pierde, costo de transición, riesgo de sobrecostos (APP, obras), contingencias fiscales.
- No repitas la ronda 1 (data/revision/economia.json) salvo que el descarte esté mal fundado.

## Reglas comunes
- Todo hallazgo con corrección aplicable (texto de reemplazo o instrucción precisa) y fuente verificada o "no verificable".
- Severidad ALTA solo para: inconstitucional/ilegal; gasto o organismo por ley congresal; norma inexistente/derogada; cifra falsa;
  violación de derechos; riesgo fiscal grave. Media: mejora sustantiva. Baja: estilo o precisión menor.
- No nombres funcionarios, congresistas ni personas; no acuses; no menciones la marca del modelo de IA. Español claro.
- Al terminar responde: n.º revisados, conteo por veredicto, y los 8 hallazgos más graves (id + una línea).
