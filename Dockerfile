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

# Install dependencies and statically-linked Tectonic LaTeX compiler (musl - zero glibc mismatch)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fontconfig \
    tar \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.17.0/tectonic-0.17.0-x86_64-unknown-linux-musl.tar.gz | tar -xz -C /usr/local/bin

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

# Ensure data directory exists
RUN mkdir -p /app/loctex_data

EXPOSE 4173

CMD ["node", "dist-server/index.mjs"]
