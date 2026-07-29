# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY u/package.json u/package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY u/ .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY --chown=101:101 docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 --chown=101:101 docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
