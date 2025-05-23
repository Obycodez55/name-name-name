# Multi-stage build for React frontend

# Base stage with Node.js
FROM node:18-alpine AS base
WORKDIR /app

# Install shared dependencies first
COPY ../shared/package*.json ../shared/
WORKDIR /app/../shared
RUN npm ci --only=production && npm run build

# Switch back to frontend
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci

# Development stage
FROM dependencies AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM dependencies AS build
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx_group && \
    adduser -S nginx_user -u 1001 -G nginx_group

# Adjust permissions
RUN chown -R nginx_user:nginx_group /usr/share/nginx/html && \
    chown -R nginx_user:nginx_group /var/cache/nginx && \
    chown -R nginx_user:nginx_group /var/log/nginx && \
    chown -R nginx_user:nginx_group /etc/nginx/conf.d

# Make directories writable
RUN chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx_user

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["nginx", "-g", "daemon off;"]