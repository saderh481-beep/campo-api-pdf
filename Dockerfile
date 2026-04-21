FROM oven/bun:1-slim AS base
WORKDIR /app
EXPOSE 8080

# Install Chromium for PDF generation
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

FROM base AS installer
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS builder
COPY package.json bun.lock ./
COPY --from=installer /app/node_modules node_modules
COPY src/ ./src/
RUN bun build src/index.ts --target bun --outdir ./dist

FROM base
COPY package.json bun.lock ./
COPY --from=installer /app/node_modules node_modules
COPY --from=builder /app/dist ./dist
COPY .env.example ./

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROMIUM_PATH=/usr/bin/chromium

ENV PORT=8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s \
  CMD wget -q --http-user="" --http-password="" --spider http://localhost:8080/health || exit 1

CMD ["bun", "dist/index.js"]