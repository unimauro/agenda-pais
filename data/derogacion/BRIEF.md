# Encargo: limpieza normativa ("gran ley de derogación") — Agenda País 2026–2056

Repo: /Users/unimauro/Documents/Repos/agenda-pais. Objetivo: identificar normas con rango de ley (y, aparte, reglamentos) que el Perú
debería DEROGAR o SIMPLIFICAR para limpiar el Estado, bajar costos para ciudadanos y empresas, y quitar ruido regulatorio. Responde a
la crítica "más leyes no es mejor país". El producto final serán unos 6–10 proyectos de "Ley de depuración normativa" por materia.

## Archivo de salida: data/derogacion/<grupo>.json (lista JSON). Un objeto por norma:
{
 "norma": "Ley N.º 31xxx, Ley que declara de necesidad pública e interés nacional…",   // número y título EXACTOS
 "fecha": "AAAA-MM-DD (publicación en El Peruano)",
 "url": "https://… (leyes.congreso.gob.pe, El Peruano, SPIJ, gob.pe) — que ABRA esa norma",
 "categoria": "declarativa | obsoleta | duplicada | implicitamente_derogada | exoneracion_tributaria | regimen_especial | tramite_barrera | otra",
 "accion": "derogar | derogar_parcial | sustituir | consolidar | evaluar_y_derogar",
 "motivo": "Por qué sobra (efecto jurídico nulo, ya cumplida, superpuesta con X, beneficio sin evaluación, barrera declarada por INDECOPI…)",
 "efecto": "Qué pasa al derogarla (ninguno práctico / ahorro / recaudación / menos trámite) y a quién afecta",
 "riesgo": "Riesgo jurídico o social de derogarla (derechos adquiridos, seguridad jurídica, compromisos)",
 "paquete": "nombre corto del proyecto de ley de depuración donde iría",
 "verificado": true,     // true SOLO si abriste la fuente y confirmaste número, título y vigencia
 "fuente_verificacion": "URL o documento donde lo confirmaste"
}
Al nivel raíz NO; solo la lista. Además, escribe data/derogacion/<grupo>_resumen.json con:
{"grupo": "…", "paquetes": [{"nombre": "…", "objeto": "…", "n_normas": 0, "instrumento": "Ley ordinaria | Ley orgánica (por qué) | DS",
  "nota_constitucional": "…"}], "cifras_contexto": [{"dato": "…", "fuente": "…", "url": "…"}], "metodo": "…", "limites": "…"}

## Reglas (CRÍTICAS)
- CERO normas inventadas: si no puedes confirmar el número y título exactos, no la incluyas (o ponla con "verificado": false y explica).
  Calidad > cantidad. Apunta a 40–80 normas verificadas por grupo.
- Usa la web: leyes.congreso.gob.pe (buscador de leyes), busquedas.elperuano.pe, spij.minjus.gob.pe, Proyectos/expedientes del
  Congreso, informes de la Defensoría, CGR, INDECOPI (barreras burocráticas), MEF (Marco Macroeconómico Multianual: gasto tributario),
  SUNAT (estimación del gasto tributario), Consejo Fiscal (informes sobre exoneraciones), PCM-SGP (Análisis de Calidad Regulatoria, ACR),
  CEPLAN. Si una búsqueda se bloquea, prueba con curl -L -A "Mozilla/5.0" o pdftotext.
- Derogar una norma no puede violar derechos adquiridos ni la cosa juzgada; señala transiciones (vigencia diferida).
- No menciones políticos ni autores de las leyes. No juzgues personas.
- Escribe INCREMENTALMENTE (reescribe el archivo cada ~8 normas) y valida con python3 -m json.tool. Solo tus archivos. No hagas git.
- Al terminar responde en ≤ 10 líneas: n.º de normas (verificadas / no), paquetes propuestos y las cifras de contexto más fuertes.
