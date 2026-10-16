# Docker setup — Ahad Raza Portfolio

**Want free hosted Docker deployment instead of running your own server?** See [FREE_DEPLOY.md](./FREE_DEPLOY.md) and `render.yaml`. Render builds this same Dockerfile, uses a migration-before-start command, and assigns an HTTPS `onrender.com` address after deployment in your account. Local Compose behavior below is unchanged.

No UI or public content is changed by this setup. All Node/npm packages, build tools, and PostgreSQL run in containers. Your computer only needs **Docker Engine/Desktop with Docker Compose v2** (current version recommended).

Run every command from the project root, where `compose.yaml` lives.

## What is containerized?

| Service | Purpose |
| --- | --- |
| `db` | PostgreSQL 17, with a persistent named volume and no published database port. |
| `migrate` | One-shot Drizzle migration container. Waits for PostgreSQL, applies checked-in SQL migrations, then exits successfully. |
| `app` | Node.js 22 + Next.js production standalone server, including all required runtime packages. Runs as a non-root user. |
| `proxy` (optional) | Caddy HTTPS reverse proxy, enabled by the production Compose override. |

The app only starts after the database is healthy and migrations succeed. Development/build dependencies remain in the build/migration images, not the minimal app image. `/api/health` checks both HTTP and the database connection.

## 1. Check Docker

Install Docker Desktop (Windows/macOS) or Docker Engine + the Compose plugin (Linux), then start the engine.

```sh
docker --version
docker compose version
docker info
```

You do **not** need to install Node.js, npm, PostgreSQL, or global Drizzle tooling on your host.

## 2. Generate private Docker credentials (once)

### Linux / macOS / WSL Bash

```sh
docker run --rm --user "$(id -u):$(id -g)" -v "${PWD}:/work" -w /work node:22-bookworm-slim node scripts/docker-init.mjs
```

The `--user` option keeps the generated file owned by your host user.

### Windows PowerShell (Docker Desktop using Linux containers)

```powershell
docker run --rm -v "${PWD}:/work" -w /work node:22-bookworm-slim node scripts/docker-init.mjs
```

The script writes `.env.docker` and prints your randomly generated **Docker admin password**. It never overwrites an existing file. Your existing `.env` / `.env.local` and preview credentials are unchanged.

To read your Docker password again locally:

```sh
grep '^ADMIN_PASSWORD=' .env.docker
```

On PowerShell:

```powershell
Select-String -Path .env.docker -Pattern '^ADMIN_PASSWORD='
```

Alternative: copy `.env.docker.example` to `.env.docker` and fill in all three blank secrets yourself. Use long URL-safe/hexadecimal database passwords, because Compose constructs a PostgreSQL connection URL. `ADMIN_SESSION_SECRET` must be at least 32 characters. Never commit `.env.docker` or share its contents.

## 3. Build and start everything

```sh
docker compose --env-file .env.docker config --quiet
docker compose --env-file .env.docker up -d --build
docker compose --env-file .env.docker ps -a
```

The first build downloads images and installs dependencies; allow a few minutes and at least roughly 2 GB of available RAM for the Next.js build. Later builds reuse cached dependency layers.

Expected status:

- `db`: running, healthy.
- `migrate`: exited with code **0** — this is normal for a one-shot migration job.
- `app`: running, then healthy after the healthcheck.

Open:

- Portfolio: **http://localhost:3000**
- Private CMS: **http://localhost:3000/admin/login**
- Health: **http://localhost:3000/api/health**

Health check from a terminal:

```sh
curl --fail http://localhost:3000/api/health
```

PowerShell alternative:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

### Fresh container data

The Docker database starts empty. Existing preview/local projects are **not automatically copied**. Add projects through the admin, or transfer your real data separately. No demo seeds or destructive schema pushes run automatically.

The base stack is bound to `127.0.0.1` only. HTTP cookies are permitted here solely for local testing. Use the HTTPS configuration below for a publicly accessible server.

If port 3000 is already used, set `APP_PORT=3001` in `.env.docker` and run `up -d` again; then use `http://localhost:3001`.

## 4. Everyday commands

### Status, logs, and resource usage

```sh
docker compose --env-file .env.docker ps -a
docker compose --env-file .env.docker logs -f --tail=100 app
docker compose --env-file .env.docker logs --tail=100 migrate
docker compose --env-file .env.docker logs -f --tail=100 db
docker compose --env-file .env.docker top
docker stats
```

Press Ctrl+C to stop following logs; containers keep running.

### Stop, start, restart

```sh
# Stop services while keeping containers and data.
docker compose --env-file .env.docker stop

# Start the previously created services again.
docker compose --env-file .env.docker up -d

# Restart only the app; this does not apply environment-file changes.
docker compose --env-file .env.docker restart app

# Remove the containers/network while KEEPING the PostgreSQL volume.
docker compose --env-file .env.docker down

# Start again from the same persisted data.
docker compose --env-file .env.docker up -d
```

Do not use `down -v` unless you intentionally want to delete the database.

### After changing application code

```sh
docker compose --env-file .env.docker up -d --build
```

### After changing the admin password or signing secret

Edit those values in `.env.docker`, then recreate the app:

```sh
docker compose --env-file .env.docker up -d --no-deps --force-recreate app
```

Changing either invalidates existing login sessions. A plain `restart` is not enough to load new environment values.

**Do not just edit `POSTGRES_PASSWORD`, `POSTGRES_USER`, or `POSTGRES_DB` for an existing database volume.** PostgreSQL only uses these values to initialize a brand-new volume. Changing them afterwards does not change the actual stored database/role password. Use `psql` and `\password` to update the role, then update the environment value and recreate the dependent containers. Back up first.

### Open shells

```sh
# App shell (no development tools are included in the minimal runtime).
docker compose --env-file .env.docker exec app sh

# PostgreSQL interactive client; no local PostgreSQL installation needed.
docker compose --env-file .env.docker exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

The PostgreSQL command uses POSIX shell quoting. On PowerShell, pass the inner command as a single-quoted string as shown.

## 5. Future database/schema changes

The checked-in `drizzle/0000_initial.sql` initializes an **empty** database. Do not apply this initial migration to a database that already has the same tables from `drizzle-kit push` without first baselining its migration history or transferring data to a fresh migrated database. The Docker stack normally uses its own new volume.

For future changes, edit `src/db/schema.ts`, then generate a migration using the containerized tools. These examples are for Linux/macOS/WSL Bash:

```sh
# Build the tooling image and run the existing stack.
docker compose --env-file .env.docker build migrate

# Mount source + migration output so newly generated files remain on your host.
docker compose --env-file .env.docker run --rm --no-deps --user "$(id -u):$(id -g)" -v "${PWD}/src/db:/app/src/db:ro" -v "${PWD}/drizzle:/app/drizzle" migrate ./node_modules/.bin/drizzle-kit generate --config=drizzle.config.ts --name=my_change
```

On Windows PowerShell, use the same `run` command without `--user "$(id -u):$(id -g)"`.

Review the new SQL and commit the complete `drizzle/` folder (SQL, snapshots, and journal). Back up the database before applying it.

```sh
# Include the newly generated migration files in the image.
docker compose --env-file .env.docker build migrate

# Explicitly run pending migrations. Previously applied migrations are skipped.
docker compose --env-file .env.docker run --rm migrate

# Rebuild/redeploy the updated app and refresh the migration service.
docker compose --env-file .env.docker up -d --build
```

Use migration-based changes rather than `drizzle-kit push --force` against real data.

## 6. Database backups and restores

These shell-redirection examples are for **Bash/Linux/macOS/WSL**, not older Windows PowerShell. Windows PowerShell 5 can corrupt redirected binary dumps; use WSL or a binary-safe file-copy workflow.

### Backup (non-destructive)

```sh
mkdir -p backups
docker compose --env-file .env.docker exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > backups/portfolio.dump
```

This backs up schema, rows, sequences, and Drizzle migration history. Store backups securely off the server too; they contain your published project/code content and database structure.

Validate the archive before using it:

```sh
docker compose --env-file .env.docker exec -T db pg_restore --list < backups/portfolio.dump
```

### Restore — replaces current data

**Only run this when you intentionally want to replace the current database with the backup. Take a new backup first.**

```sh
# Avoid requests writing data while it is restored.
docker compose --env-file .env.docker stop app

# Ensure the archive is non-empty and restore it. --clean drops existing objects.
test -s backups/portfolio.dump && docker compose --env-file .env.docker exec -T db sh -c 'pg_restore --clean --if-exists --no-owner --no-privileges --exit-on-error -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < backups/portfolio.dump

# If restore succeeded, start the app again.
docker compose --env-file .env.docker up -d
```

### Transfer from an existing non-Docker database

For a database originally created with `drizzle-kit push`, do not restore its full schema over the migrated Docker database. Export **public-schema data only**, then import into an empty, migrated Docker database. This preserves Docker's new migration history. Keep backup copies and review the source/target schema before a transfer. A future migration history baseline should be performed deliberately, not automatically.

## 7. Optional production HTTPS with Caddy

On your server:

1. Use unique strong passwords in `.env.docker`; do not reuse preview credentials.
2. Set `DOMAIN=portfolio.your-domain.com` (bare domain, no `https://` or path).
3. Set `ACME_EMAIL` to your email for certificate notices.
4. Point DNS A/AAAA records to this server; only publish an AAAA record if IPv6 routing works.
5. Allow incoming TCP 80 and 443; UDP 443 is optional for HTTP/3.

Start the production stack:

```sh
docker compose --env-file .env.docker -f compose.yaml -f compose.production.yaml config --quiet
docker compose --env-file .env.docker -f compose.yaml -f compose.production.yaml up -d --build
docker compose --env-file .env.docker -f compose.yaml -f compose.production.yaml ps -a
docker compose --env-file .env.docker -f compose.yaml -f compose.production.yaml logs -f --tail=100 proxy
```

Caddy requests and renews a real TLS certificate, redirects HTTP to HTTPS, and proxies to `app:3000`. Certificates persist in `caddy_data`. This override forces secure admin cookies on, regardless of the local cookie setting. Use the HTTPS domain for the admin login; HTTP localhost login is no longer the intended access path in this mode.

Check the deployed site:

```sh
curl --fail https://portfolio.your-domain.com/api/health
```

Use the same `-f compose.yaml -f compose.production.yaml` flags for subsequent production updates, restarts, password changes, and shutdowns. Otherwise you can accidentally recreate the app using the local insecure-cookie configuration.

```sh
# Apply code updates with the production configuration.
docker compose --env-file .env.docker -f compose.yaml -f compose.production.yaml up -d --build

# Load a changed admin password without rebuilding.
docker compose --env-file .env.docker -f compose.yaml -f compose.production.yaml up -d --no-deps --force-recreate app

# Stop/remove the production containers but retain DB and TLS volumes.
docker compose --env-file .env.docker -f compose.yaml -f compose.production.yaml down
```

Add host/proxy-level login rate limiting and keep Docker/base images updated before exposing a password-only admin publicly. A healthcheck reports failures but does not, by itself, restart an unhealthy container.

## 8. Advanced image commands

```sh
# Build just the minimal app image.
docker build --target runner -t ahad-portfolio-app:local .

# Build just the database-tooling image.
docker build --target migrations -t ahad-portfolio-migrations:local .

# Refresh base images and rebuild (PostgreSQL stays on major version 17).
docker compose --env-file .env.docker pull db
docker compose --env-file .env.docker build --pull
docker compose --env-file .env.docker up -d

# Bypass build caches when troubleshooting.
docker compose --env-file .env.docker build --no-cache app migrate
```

The image contains no `.env*` files, no host `node_modules`, and no database backups. Secrets are injected only at runtime. Anyone with Docker engine access can inspect container environment variables, so restrict engine access.

Image tags intentionally pin major Node/PostgreSQL versions while receiving patch updates on pulls. Keep `package-lock.json` committed so `npm ci` installs deterministic npm dependency versions. Major PostgreSQL upgrades need a planned dump/restore or `pg_upgrade`; do not just change the major image tag on the same data volume.

## 9. Full reset — destructive

**WARNING: this deletes every project/code file in the Docker database. Back up first.**

```sh
docker compose --env-file .env.docker down -v
```

For the HTTPS stack, including the production override also removes its certificate volumes with `-v`. Keep `.env.docker`; start again with `up -d --build` to initialize an empty database.

## Troubleshooting

- **Cannot connect to Docker daemon:** start Docker Desktop/Engine and confirm `docker info` works.
- **Missing secret error:** generate `.env.docker` and always pass `--env-file .env.docker`.
- **Migration service exited 0:** expected; only `app` and `db` are long-lived services locally.
- **Migration service failed:** inspect `logs migrate`; app startup deliberately waits rather than serving broken database pages.
- **Database password authentication failed after editing `.env.docker`:** an existing volume still uses its original role password. Do not regenerate credentials to fix it; update the role or restore the original configuration.
- **Permission denied creating `.env.docker`:** on Linux/macOS use the initializer command's `--user` option.
- **Port already allocated:** edit `APP_PORT`, then run `up -d`.
- **Build runs out of memory:** allocate more RAM to Docker; keep build tools available in the build stage.
- **Admin login on a remote HTTP IP does not persist:** use the HTTPS production setup, not insecure public HTTP.
- **New Docker stack has no old projects:** volumes are separate from the preview database. Populate the CMS or transfer data deliberately.
- **Lost data after `down -v`:** restore a backup; Docker cannot recover a deleted volume automatically.

## Validation note

The application build/type checks and migration/configuration checks are validated in the development environment. A Docker engine is not available in the preview sandbox, so image building and container startup must be confirmed on your Docker-equipped computer using the commands above.
