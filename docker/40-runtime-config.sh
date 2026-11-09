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

agent_queue=false
if [ "${PUBLIC_AGENT_QUEUE_ENABLED:-false}" = "true" ]; then
  agent_queue=true
fi

printf 'window.RUNTIME_CONFIG = Object.freeze({ PUBLIC_API_URL: "%s", PUBLIC_AGENT_QUEUE_ENABLED: %s });\n' \
  "$escaped_api_url" "$agent_queue" \
  > /usr/share/nginx/html/runtime-config.js
