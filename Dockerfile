# ==============================================================================
# SMART KITCHEN AI - PRODUCTION DOCKERFILE
# Multi-stage optimized build for minimal image size and maximum security
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend and Server
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies required for building
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code and build assets
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Minimal Runtime
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled frontend and bundled server from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security best practices
USER node

EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production server
CMD ["node", "dist/server.js"]
