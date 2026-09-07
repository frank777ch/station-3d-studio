#!/usr/bin/env bash
# Publica el build en el VPS (Caddy sirve /var/www/vape-studio en http://108.175.12.132/).
# Uso: npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
rsync -az --delete dist/ rendo-vps:/var/www/vape-studio/
ssh rendo-vps 'chown -R deploy:deploy /var/www/vape-studio'
echo "Publicado en http://108.175.12.132/"
