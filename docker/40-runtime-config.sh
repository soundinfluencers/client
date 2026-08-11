#!/bin/sh
set -eu

: "${PUBLIC_API_URL:?PUBLIC_API_URL must be set to the public backend URL}"

case "$PUBLIC_API_URL" in
  http://*|https://*) ;;
  *)
    echo "PUBLIC_API_URL must start with http:// or https://" >&2
    exit 1
    ;;
esac

escaped_api_url="$(printf '%s' "$PUBLIC_API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')"

printf 'window.RUNTIME_CONFIG = Object.freeze({ PUBLIC_API_URL: "%s" });\n' \
  "$escaped_api_url" \
  > /usr/share/nginx/html/runtime-config.js
