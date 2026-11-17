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

payments_disabled="${PAYMENTS_DISABLED:-false}"
case "$payments_disabled" in
  true|false) ;;
  *)
    echo "PAYMENTS_DISABLED must be true or false" >&2
    exit 1
    ;;
esac

printf 'window.RUNTIME_CONFIG = Object.freeze({ PUBLIC_API_URL: "%s", PAYMENTS_DISABLED: %s });\n' \
  "$escaped_api_url" "$payments_disabled" \
  > /usr/share/nginx/html/runtime-config.js
