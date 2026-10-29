# CVE-2026-111497: pin patched Node (floating 24-alpine can serve a cached vulnerable build).
FROM node:26.13.0-alpine AS build

# Stage 1 — Build the application
RUN apk add --no-cache git ca-certificates && update-ca-certificates
# Bun <1.4.4 bundles the same vulnerable Brotli decoder.
RUN npm install -g bun@1.4.4
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=8192

# Optional: needed when Nuxt extends private github: layers (e.g. DCC-BS/nuxt-layers)
ARG GITHUB_TOKEN
RUN if [ -n "$GITHUB_TOKEN" ]; then \
      git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"; \
    fi

COPY package.json bun.lock ./
RUN bun install --ci

COPY . .
RUN bun x nuxi prepare
RUN bun x nuxi build

# Stage 2 — Run the application
FROM node:26.13.0-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PORT=8010
ENV NITRO_HOST=0.0.0.0

COPY --from=build /app/.output ./


WORKDIR /app/server
RUN rm -rf node_modules \
  && npm install --omit=dev --no-package-lock --legacy-peer-deps
WORKDIR /app

EXPOSE 8010

CMD ["node", "server/index.mjs"]
