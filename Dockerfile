# =========================================================
# Stage 1: Build & Test Environment
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (ci for deterministic builds)
RUN npm ci

# Copy application source code and tests
COPY src/ ./src/
COPY test/ ./test/

# Run unit tests as part of container build pipeline
RUN npm test

# =========================================================
# Stage 2: Production Nginx Server
# =========================================================
FROM nginx:1.25-alpine AS production

# Label metadata for container tracking
LABEL maintainer="DevOps Team <devops@matrix.internal>"
LABEL version="1.0.0"
LABEL description="Matrix Rain Effect Canvas Web Application"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/src /usr/share/nginx/html

# Create non-root user and assign permission
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Switch to unprivileged user for security hardening
USER nginx

# Expose HTTP port
EXPOSE 8080

# Healthcheck configuration
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
