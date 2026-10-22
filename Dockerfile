# Multi-stage Docker build for LocTex (Fastify + React + Tectonic LaTeX)
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy project source
COPY . .

# Build client (Vite + React) and backend server (Fastify via esbuild)
RUN npm run build

# Production Runner stage
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install tectonic & curl for LaTeX compiling and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    tectonic \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4173
ENV LOCTEX_DATA_DIR=/app/loctex_data
ENV OLLAMA_ENDPOINT=http://ollama:11434

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundles and public assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/loctex_data ./loctex_data_seed

# Ensure data directory exists
RUN mkdir -p /app/loctex_data

EXPOSE 4173

# Entrypoint script: seed data directory if empty, then start server
CMD ["sh", "-c", "if [ ! -f /app/loctex_data/loctex.db ] && [ -d /app/loctex_data_seed ]; then cp -rn /app/loctex_data_seed/* /app/loctex_data/ 2>/dev/null || true; fi; node dist-server/index.mjs"]
