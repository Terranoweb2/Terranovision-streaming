# Base stage
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
# Install ffmpeg
RUN apk add --no-cache ffmpeg
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY services/stream-gateway/package.json ./services/stream-gateway/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY services/stream-gateway ./services/stream-gateway
COPY package.json pnpm-workspace.yaml ./
RUN cd services/stream-gateway && pnpm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
RUN apk add --no-cache ffmpeg
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/services/stream-gateway/dist ./services/stream-gateway/dist
COPY services/stream-gateway/package.json ./services/stream-gateway/
WORKDIR /app/services/stream-gateway
RUN mkdir -p /app/services/stream-gateway/hls
EXPOSE 4001
CMD ["node", "dist/index.js"]

# Development stage
FROM base AS development
RUN apk add --no-cache ffmpeg
COPY --from=dependencies /app/node_modules ./node_modules
COPY services/stream-gateway ./services/stream-gateway
WORKDIR /app/services/stream-gateway
RUN mkdir -p /app/services/stream-gateway/hls
EXPOSE 4001
CMD ["pnpm", "run", "dev"]
