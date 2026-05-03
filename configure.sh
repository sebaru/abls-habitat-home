#!/bin/bash
# configure.sh — Génère public/js/config.js depuis les variables d'environnement.
# Usage : ABLS_API=https://... IDP_REALM=... IDP_URL=... IDP_CLIENT_ID=... ./configure.sh
# Ou : exporter les variables d'abord, puis ./configure.sh

set -e

: "${ABLS_API:?La variable ABLS_API est requise}"
: "${IDP_REALM:?La variable IDP_REALM est requise}"
: "${IDP_URL:?La variable IDP_URL est requise}"
: "${IDP_CLIENT_ID:?La variable IDP_CLIENT_ID est requise}"

cat > public/js/config.js << EOF
var \$ABLS_API      = "${ABLS_API}";
var \$IDP_REALM     = "${IDP_REALM}";
var \$IDP_URL       = "${IDP_URL}";
var \$IDP_CLIENT_ID = "${IDP_CLIENT_ID}";
EOF

echo "public/js/config.js généré avec succès."
