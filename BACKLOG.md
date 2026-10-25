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

## SIGUIENTE
1. [ ] Sectores restantes (uno o dos por agente, con `BRIEF_SECTOR.md`): agua, energia, mineria, transporte, seguridad, economia,
       agro, ambiente, estado, vivienda, proteccion.
2. [ ] Revisión especializada por sector (constitucional/fiscal + verificador de cifras y URLs), como en Agenda Tech.
3. [ ] Re-enlazar `depende_de` entre sectores cuando existan (p. ej. anemia SAL ↔ EDU).
4. [ ] Participación ciudadana (votos/comentarios). OJO: el módulo de api.tunky.net es SOLO para Agenda Legislativa; para este
       proyecto hace falta un módulo propio o preguntar a Carlos.
5. [ ] Plantilla replicable para otros países (México: Gilberto E. lo pidió) — separar datos de plantilla.
6. [ ] Revisión humana experta por sector.
