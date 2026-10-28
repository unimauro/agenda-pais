#!/bin/bash
# Despliega el asistente de Agenda País (pais.js) en api.tunky.net (VPS /opt/api-tunky). No toca el módulo /agenda.
# Respaldo de server.js, chequeo de sintaxis ANTES de reconstruir, y prueba al final.
# Uso (desde la raíz del repo):  bash deploy/api-tunky/deploy.sh
set -euo pipefail
VPS=root@217.15.168.100
DIR="$(cd "$(dirname "$0")" && pwd)"
scp -q "$DIR/pais.js" "$DIR/patch.py" "$VPS:/tmp/"
ssh "$VPS" 'set -e; cd /opt/api-tunky
  cp src/server.js "src/server.js.bak.pais.$(date +%s)"
  cp /tmp/pais.js src/pais.js
  python3 /tmp/patch.py
  docker run --rm -v /opt/api-tunky/src:/s:ro node:20-alpine sh -c "node -c /s/server.js && node -c /s/pais.js"
  docker compose up -d --build api-tunky
  sleep 6; docker logs --tail 6 api-tunky'
echo "--- prueba ---"
curl -s https://api.tunky.net/health; echo
curl -s -X POST -H "Origin: https://unimauro.github.io" -H "Content-Type: application/json" -d '{"q":"¿Qué se propone para la anemia?"}' https://api.tunky.net/pais/chat | head -c 600; echo
