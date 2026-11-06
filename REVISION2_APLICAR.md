# Ronda 2, fase 2: aplicar la revisión (cada dueño SOLO en sus archivos)

Hallazgos en `data/revision/r2-{gobtech,gestion,constitucional,ddhh,economia}.json`. Filtra los tuyos por `archivo` y por prefijo de id
(algunos hallazgos citan varios ids en el texto: búscalos también por texto):
`python3 -c "import json,glob;[print(f.split('/')[-1],json.dumps(x,ensure_ascii=False)) for f in sorted(glob.glob('data/revision/r2-*.json')) for x in json.load(open(f)) if x.get('archivo')=='data/sectores/salud.json' or 'SAL-' in json.dumps(x)]"`

Reglas (las mismas de REVISION_APLICAR.md, resumidas)
1. Alta: corrígela siempre o justifica con fuente por qué no. Media: aplica salvo que esté mal. Baja: a criterio.
2. Antes de cambiar una cifra o norma marcada "no verificable", verifica en web; si no puedes, escribe "(por verificar)" en vez de afirmar.
3. En cada acción o bloque tocado AÑADE (no reemplaces los existentes) a `revision_atendida` un objeto
   `{"rol": "r2-ddhh", "hallazgo": "<5-12 palabras>", "decision": "aplicado | descartado: <motivo>"}`. Para diagnóstico/metas usa el
   `revision_atendida` a nivel de sector.
4. Coherencia: no borres ids; reformula. `depende_de` = "necesita primero": nada circular ni hacia etapas posteriores. Un nuevo id tech en
   depende_de solo si existe en agenda-legislativa-tech. Beneficios tributarios cumplen Norma VII (DL 1521). Ley 32353 entra en vigencia
   con su reglamento (aún no publicado): redacta en condicional.
5. No cambies esquema, ids, colores ni etapas válidas (2026-2031, 2031-2036, 2036-2046, 2046-2056). Sin nombres de personas, sin
   acusaciones, sin marca del modelo de IA. Español claro para ciudadanos.
6. Escritura segura: lee el JSON, modifica en memoria, escribe a .tmp, valida con json.load y recién os.replace. NUNCA
   `open(f,'w').write(json.dumps(json.load(open(f))))`. Conserva indent=2 (usa el indent del archivo) y ensure_ascii=False.
7. Al terminar valida con json.load. NO corras scripts/build.py (el líder construye al final). Responde: hallazgos aplicados / descartados
   (con motivo) por severidad, y cualquier cosa que deba decidir otro sector.
