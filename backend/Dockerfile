# ─── Backend Dockerfile ───────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies layer
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Final image
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nodeapp

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER nodeapp
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
