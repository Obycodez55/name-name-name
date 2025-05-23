# Multi-stage build for NestJS backend

# Base stage with Node.js
FROM node:18-alpine AS base
RUN apk add --no-cache curl
WORKDIR /app

# Install shared dependencies first
COPY ../shared/package*.json ../shared/
WORKDIR /app/../shared
RUN npm ci --only=production && npm run build

# Switch back to backend
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci

# Development stage
FROM dependencies AS development
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Production build stage
FROM dependencies AS build
COPY . .
RUN npm run build && npm prune --production

# Production stage
FROM node:18-alpine AS production
RUN apk add --no-cache curl dumb-init
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown nestjs:nodejs logs

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["dumb-init", "node", "dist/main"]
