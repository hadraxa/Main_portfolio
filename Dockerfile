# syntax=docker/dockerfile:1

# Same Linux/Node base for build and runtime to keep native packages compatible.
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install all dependencies inside Docker, using the committed npm lockfile.
# Build tools are needed here but will not be shipped in the app runtime image.
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# One-shot database migration image, also useful for generating future migrations.
FROM dependencies AS migrations
COPY drizzle.config.ts tsconfig.json ./
COPY src/db ./src/db
COPY drizzle ./drizzle
USER node
CMD ["./node_modules/.bin/drizzle-kit", "migrate", "--config=drizzle.config.ts"]

# Build Next.js without connecting to the database or baking secrets into the image.
FROM dependencies AS builder
COPY . .
# public/ may be empty in this project. Create it so the runtime COPY is reliable.
# This non-secret URL only satisfies configuration loading while Next.js builds;
# dynamic pages connect to the real database at runtime, not during this step.
RUN mkdir -p public && \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build_only npm run build

# Minimal, non-root production image: only the traced server and static assets.
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# Include the migration runtime explicitly: Next.js does not trace helper scripts
# outside its routes. No development tools or real environment files are copied.
COPY --from=dependencies --chown=node:node /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=builder --chown=node:node /app/drizzle ./drizzle
COPY --from=builder --chown=node:node /app/scripts/hosted-start.mjs ./scripts/hosted-start.mjs
RUN mkdir -p .next/cache && chown node:node .next/cache
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health', { signal: AbortSignal.timeout(4000) }).then(async r => { if (!r.ok || (await r.json()).ok !== true) process.exit(1); }).catch(() => process.exit(1));"
# Compose uses its separate migration service. Render overrides this command
# with node scripts/hosted-start.mjs to run migrations on free instances.
CMD ["node", "server.js"]
