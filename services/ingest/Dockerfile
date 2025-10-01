# Base stage
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY services/ingest/package.json ./services/ingest/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY packages/database ./packages/database
COPY services/ingest ./services/ingest
COPY package.json pnpm-workspace.yaml ./
RUN cd packages/database && pnpm run generate
RUN cd services/ingest && pnpm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/services/ingest/dist ./services/ingest/dist
COPY --from=build /app/packages/database ./packages/database
COPY services/ingest/package.json ./services/ingest/
WORKDIR /app/services/ingest
EXPOSE 4000
CMD ["node", "dist/main.js"]

# Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY packages/database ./packages/database
COPY services/ingest ./services/ingest
WORKDIR /app/services/ingest
EXPOSE 4000
CMD ["pnpm", "run", "dev"]
