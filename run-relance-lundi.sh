#!/bin/bash
# Relance d'activation #2 pour Préco, programmée le 15/10/2026 pour lundi
# 19/10/2026 à 8h heure Guadeloupe (12h UTC). Lancé une seule fois par cron,
# puis se retire tout seul du crontab et efface les scripts temporaires.
set -e
cd /opt/apps/soguasphar-preco

echo "=== Relance lundi Préco : $(date -u) ==="
sudo docker exec soguasphar-preco node /app/data/relance-lundi.js

COUNT=$(node -e "try{const r=require('./data/relance-lundi-resultats.json'); console.log(Array.isArray(r)? r.filter(x=>x.ok).length + '/' + r.length : '0')}catch(e){console.log('?')}")
DATESTAMP=$(date -u +"%Y-%m-%d %H:%M")

sudo tee -a /opt/infra/cloclo/journal.md > /dev/null <<EOF
- $DATESTAMP | Hélène | Préco | 2e relance d'activation de compte envoyée (${COUNT} e-mails) aux pharmacies toujours jamais connectées | En ligne : oui
EOF

# Nettoyage : ce script ne doit tourner qu'une fois.
rm -f /opt/apps/soguasphar-preco/data/relance-lundi.js
( crontab -l 2>/dev/null | grep -v "run-relance-lundi.sh" ) | crontab -

echo "=== Terminé, tâche retirée du crontab ==="
