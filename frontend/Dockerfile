# ─── Frontend Dockerfile ──────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Build
FROM deps AS builder
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
