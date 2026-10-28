# Protocolo de revisión especializada de Agenda País (fase 1: solo lectura)

Cada revisor lee SOLO lo de su encargo en `data/sectores/<sector>.json` y/o `data/derogacion/*.json` (NO los modifica:
cada archivo tiene un dueño que aplicará las correcciones después) y escribe UN archivo `data/revision/<rol>.json`
(lista JSON, un objeto por elemento revisado):

```json
{
  "id": "SAL-07",                       // id de acción, o "sector:salud" (diagnóstico/metas/fuentes), o "norma:Ley 31618"
  "archivo": "data/sectores/salud.json",
  "rol": "constitucional-fiscal",
  "veredicto": "conforme | observaciones | observaciones_graves",
  "resumen": "1-3 frases",
  "hallazgos": [
    {
      "severidad": "alta | media | baja",
      "campo": "necesita_ley | que | costo_referencial | depende_de | metas[2] | fuentes[0] | ...",
      "problema": "Qué está mal y por qué (cita norma, dato o fuente).",
      "correccion": "Texto de reemplazo concreto o instrucción precisa aplicable por el dueño del archivo.",
      "fuente": "URL verificada (abierta por ti) que respalda la corrección, o \"no verificable\""
    }
  ]
}
```

Reglas
- Escribe el archivo de forma INCREMENTAL (reescríbelo completo cada 4-5 elementos) para no perder trabajo. Lista vacía al inicio.
- Lee con python por id; no vuelques archivos completos: `python3 -c "import json;s=json.load(open('data/sectores/salud.json'));print(json.dumps([a for a in s['acciones'] if a['id']=='SAL-07'][0],ensure_ascii=False,indent=1))"`.
- Severidad ALTA = inconstitucional o ilegal; iniciativa de gasto del Congreso (art. 79); crear organismos por ley ordinaria sin respetar LOPE art. 28 / reserva; materia de ley orgánica sin decirlo; omite consulta previa (Convenio 169) cuando afecta pueblos indígenas; beneficio tributario sin Norma VII (objetivo, beneficiarios, plazo ≤3 años, costo); norma inexistente, derogada o mal numerada; cifra falsa o URL que no respalda lo afirmado; dato que pone en riesgo a personas.
- Cada hallazgo con corrección aplicable. Nada genérico. Reporta solo lo que vale la pena corregir; "conforme" sin hallazgos está bien.
- Verifica en web lo que dudes (El Peruano busquedas.elperuano.pe, SPIJ spij.minjus.gob.pe, leyes.congreso.gob.pe, gob.pe, INEI, BCRP, MEF, TC tc.gob.pe). No inventes números, sentencias ni URLs; si no puedes verificar, escribe "no verificable".
- Contexto: Congreso bicameral 2026–2031 (Ley 31988). Plan Perú 2050 = PEDN de CEPLAN (campo `pedn`).
- NO nombres funcionarios, congresistas ni personas; no acuses a nadie. No menciones la marca del modelo de IA. Español claro.
- Al terminar responde: n.º revisados, conteo por veredicto, y los 5 hallazgos más graves (id + una línea).
