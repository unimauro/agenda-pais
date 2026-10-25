# Agenda País 2026–2056

Hoja de ruta ciudadana a 30 años para el Perú, sector por sector: qué construir, qué servicio mejorar, quién responde,
cómo se financia y qué ley sí hace falta. Hermano de [Agenda Legislativa Tech](https://unimauro.github.io/agenda-legislativa-tech/).

Sitio: https://unimauro.github.io/agenda-pais/

- `data/sectores/<id>.json`: un archivo por sector (esquema en `BRIEF_SECTOR.md`).
- `scripts/build.py`: genera `index.html` (mapa de metro), `s/<id>.html`, `entidades.html`, `metodo.html`, `data/indice.json`, `sitemap.xml`, `og.png`.
- Sin dependencias: `python3 scripts/build.py` (og.png requiere `rsvg-convert`).

Propuesta ciudadana independiente, no un plan oficial. Contenido redactado con agentes de IA especializados; falta revisión humana experta.
