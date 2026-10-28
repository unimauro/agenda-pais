# BACKLOG — Agenda País 2026–2056

Lee esto primero si continúas el proyecto (otra IA u otra sesión).

## Estado
- Origen (25-oct-2026): comentarios de LinkedIn al proyecto Agenda Legislativa Tech: (1) ver iniciativas por tema y entidad del Estado
  y quién participa; (2) "más leyes no es mejor país: hacen falta estrategias, ejecución y desregular"; (3) replicarlo en México.
- Decisión de Carlos: repo aparte, nivel nacional, todos los sectores, horizonte 30 años (2026–2056); empezar por Salud y Educación.
- Diseño: mapa de metro (línea = sector, estación = acción; punto sólido = no necesita ley, anillo = ley, anillo tachado = derogación;
  curvas grises = dependencias entre sectores). Tipos: Archivo (títulos) + Source Serif 4 (texto). Sin estilos en línea (CSP):
  colores por `data-c` en `assets/sectores.css` generado por build.py.
- Sectores escritos: ver `data/sectores/`. Digital consolida las 128 propuestas tech (leyes marco + paquetes ejecutivos + obras).

## Hecho 25-oct-2026 (2.ª tanda)
- Sectores: estado (Reforma del Estado, EST-01..28) y economia (Economía productiva, ECP-01..28: salir de materias primas). Total 5 sectores, 136 acciones.
- Página **Perú 2050** (`peru2050.html`): alineamiento de cada acción con las 162 AE del PEDN 2050 (campo `pedn`; `data/pedn_estructura.json`
  copiado de plan-peru-2050, fuente CEPLAN). Cobertura actual 80/162; los vacíos se ven por OE.
- Página **Limpieza normativa** (`limpieza.html`): `data/derogacion/{A_leyes,B_beneficios_tramites}.json` + `_resumen.json`. 123 normas verificadas en
  10 paquetes (declarativas sin efecto, temporales agotadas, calendario cívico, TUO discapacidad, juventudes; beneficios tributarios con caducidad,
  exoneraciones regionales → inversión, convergencia MYPE, régimen único de empleo público, guillotina regulatoria). Solo se publican `verificado: true`.
- Cifras clave: 448/1823 leyes 2016–2025 declarativas (24,6 %, conteo propio); gasto tributario 2026 S/ 26 350 M (2,16 % PBI); 2572 obras paralizadas
  (S/ 43 163 M, CGR mar-2025); 51,8 % del PIM 2026 en acciones centrales/APNOP; 66,8 % de objetivos de políticas desarticulados del PEDN.

## Hecho 28-oct-2026 (3.ª tanda)
- 9 sectores nuevos: agua (AGU), vivienda (VIV), energia (ENE), mineria (MIN), transporte (TRA), ambiente (AMB), seguridad (SEG), agro (AGR),
  proteccion (PRO). Total 14 sectores, 357 acciones (136 ejecutivas, 107 servicios, 50 obras, 42 leyes = 12 %, 22 derogaciones).
- Perú 2050: 135 de 162 AE cubiertas. 195 normas para derogar/simplificar (123 en paquetes + derogaciones sectoriales).
- Mapa: conexiones atenuadas; al pasar sobre una estación se resaltan solo sus dependencias.
- Cruce resuelto: cierre del REINFO solo en MIN-04/05; AMB-06 = monitoreo de mercurio.
- Contexto nuevo verificado: DS 016-2026-VIVIENDA (25-oct-2026) declara en emergencia Vivienda y Saneamiento; DS 010-2026-VIVIENDA = Política
  Nacional Multisectorial de Agua y Saneamiento al 2050. Seguridad no duplica la delegación de la Ley 32743.

## SIGUIENTE
1. [x] Los 14 sectores escritos (28-oct-2026). Faltan 27 AE del PEDN sin acción: ver peru2050.html.
2. [x] (28-oct) Revisión especializada: 6 revisores (constitucional-fiscal, jurista, cifras/URLs, seguridad, economía, SPIJ) → data/revision/*.json (~390 hallazgos); 12 dueños aplicaron con revision_atendida. SEG-25 reformulada (Leyes 32108+32138, alineación con Palermo, neutral). Grafo sin ciclos ni dependencias a etapas posteriores. (constitucional/fiscal + verificador de cifras y URLs), como en Agenda Tech.
3. [ ] Re-enlazar `depende_de` entre sectores cuando existan (p. ej. anemia SAL ↔ EDU).
4. [ ] Participación ciudadana (votos/comentarios). OJO: el módulo de api.tunky.net es SOLO para Agenda Legislativa; para este
       proyecto hace falta un módulo propio o preguntar a Carlos.
5. [ ] Plantilla replicable para otros países (México: Gilberto E. lo pidió) — separar datos de plantilla.
6. [ ] Revisión humana experta por sector.
7. [ ] Verificador independiente de la lista de derogación (vigencia en SPIJ, que el Archivo del Congreso marca todo como vigente) y de las 4 normas
       sin verificar del grupo B. Leyes de 2026 aún no cubiertas en el conteo de declarativas.
8. [ ] Redactar el articulado de los 10 paquetes de depuración (proyectos de ley completos, como en Agenda Tech) y PDF descargable.

- [x] (28-oct) Modo claro por defecto + botón ◐; asistente en todas las páginas (búsqueda local + IA vía /pais/chat).
- [ ] Carlos: desplegar `bash deploy/api-tunky/deploy.sh` (módulo pais.js en api.tunky.net) y probar el chat en vivo.

- [ ] Pendientes de la revisión (28-oct), marcados "(por verificar)" en los datos: costo régimen agrario (S/ 1 888 M), IGV amazónico (>S/ 3 700 M), cifras SEG (extorsión, 39 % policías en comisarías, presos sin sentencia), canon BEM 2025, B9 plazo reintegro Ley 31893, fecha de corte AMB-03/AGR-17 (22-jul-2011?), Ley 31850 (TRA-05), B1 URL oficial Ley 32542.
- [ ] Propuestas de articulación sin acción propia: regla de ahorro de rentas mineras en el Fondo de Estabilización Fiscal (EST-19).
- [ ] Revisión humana experta sigue pendiente (la de agentes no la reemplaza).
