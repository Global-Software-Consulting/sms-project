# ---- Production deps (runtime node_modules for custom server.js) ----
# The standalone build's trimmed node_modules strips internals that the
# public `require('next')` API needs (e.g. next/dist/compiled/webpack/
# webpack-lib). Our custom server.js uses that API, so we overlay the
# full production node_modules on top of the standalone output — exactly
# what the IPTV reference Dockerfile does for the same reason.
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Builder ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

# Webpack build (matches IPTV reference). next.config.ts has
# `output: "standalone"`, so this produces .next/standalone/.
RUN npm run build

# ---- Production ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output first (includes .next/server, manifests, a trimmed
# node_modules), then static assets, then our custom server.js which
# replaces the standalone-generated one.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js

# Overlay full production node_modules over the standalone trimmed one —
# required for the public next() API used by server.js. Mirrors IPTV.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

CMD ["node", "server.js"]
