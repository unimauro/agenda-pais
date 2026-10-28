# Fase 2: aplicar la revisión (cada dueño SOLO en sus archivos)

Hallazgos en `data/revision/{constitucional-fiscal,jurista,cifras,seguridad,economia,spij}.json`. Filtra los tuyos por `archivo`
(y por prefijo de id; el jurista y spij a veces citan varios ids en un hallazgo: búscalos también por texto):
`python3 -c "import json,glob;[print(f.split('/')[-1],json.dumps(x,ensure_ascii=False)) for f in glob.glob('data/revision/*.json') for x in json.load(open(f)) if x.get('archivo')=='data/sectores/salud.json' or 'SAL-' in json.dumps(x)]"`

Cómo aplicar
1. Severidad alta: corrígela siempre (o justifica por qué no con fuente). Media: aplica salvo que esté mal. Baja: a criterio.
2. Verifica en web antes de cambiar una cifra o norma si el hallazgo dice "no verificable"; si no puedes verificar, marca "(por verificar)" en el texto en vez de afirmar.
3. En cada acción o bloque tocado agrega `"revision_atendida": [{"rol": "jurista", "hallazgo": "<5-12 palabras>", "decision": "aplicado | descartado: <motivo>"}]`. Para diagnóstico/metas usa `revision_atendida` a nivel de sector.
4. Reglas comunes de coherencia entre sectores:
   - Duplicados: el jurista indica qué acción se queda; si la tuya NO es la que queda, reformúlala a tu ángulo propio o conviértela en dependencia (depende_de) de la que queda. No borres ids (rompería enlaces): reformula.
   - depende_de = "necesita primero". Quita los enlaces circulares que el jurista indique y las dependencias hacia etapas posteriores (pásalas al texto como "se complementa con X" si importa).
   - Cifras compartidas, usa la más reciente oficial: anemia ENDES 2025 = 34,9 %; exportaciones mineras MINEM 2025 = US$ 62 848 millones; coca DEVIDA 2025 = 84 546 ha.
   - Leyes declarativas (EST-22, SAL-06, TRA-05): excluir las que sustentan expropiaciones en curso (Const. art. 70, DL 1192). Ley 32488 abarca obras en 10 departamentos.
   - Beneficios tributarios: deben cumplir la Norma VII vigente (DL 1521: máx. 3 años, una prórroga con evaluación previa, costo y beneficiarios). ENE-24/MIN-24 se unifican: queda MIN-24, ENE-24 pasa a depender de ella.
   - Ley 32353 (MYPE, 27-05-2025) derogó la Ley 28015 y la parte MYPE de la Ley 30056 y dejó sin efecto el TUO D.S. 013-2013-PRODUCE.
5. No cambies el esquema, ids, colores ni etapas válidas (2026-2031, 2031-2036, 2036-2046, 2046-2056). Sin nombres de personas, sin acusaciones, sin marca del modelo de IA.
6. Escritura segura: lee el JSON, modifica en memoria, escribe a un .tmp, valida con json.load y recién reemplaza (os.replace). NUNCA `open(f,'w').write(json.dumps(json.load(open(f))))` (trunca el archivo). Conserva indent=2 y ensure_ascii=False.
7. Al terminar valida tu archivo con json.load (NO corras scripts/build.py: otros agentes escriben a la vez; el líder construye al final). Responde: hallazgos aplicados / descartados (con motivo) por severidad, y cualquier cosa que deba decidir otro sector.
