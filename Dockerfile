FROM node:24-alpine AS build

# Stage 1 — Build the application
RUN apk add --no-cache git ca-certificates && update-ca-certificates
RUN npm install -g bun
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
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PORT=8010
ENV NITRO_HOST=0.0.0.0

COPY --from=build /app/.output ./

EXPOSE 8010

CMD ["node", "server/index.mjs"]
