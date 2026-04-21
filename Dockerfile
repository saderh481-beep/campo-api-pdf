FROM oven/bun:1-slim AS base
WORKDIR /app
EXPOSE 3002

FROM base AS installer
RUN bun install --frozen-lockfile --production

FROM base AS builder
COPY --from=installer /app/node_modules /app/node_modules
COPY package.json tsconfig.json ./
COPY src/ ./src/
RUN bun build src/index.ts --target bun --outdir ./dist

FROM base
COPY --from=installer /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY .env.example ./

ENV NODE_ENV=production
ENV PORT=3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget -q --http-user="" --http-password="" --spider http://localhost:3002/health/ready || exit 1

CMD ["bun", "dist/index.js"]