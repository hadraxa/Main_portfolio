# Publish on a free HTTPS address

## What is ready, and what is not yet deployed

This repository includes a free Render deployment configuration (`render.yaml`), your Docker image, and a migration-before-start command. It does not provision a hosting account, database, or domain by itself.

A permanent deployment must be authorized in **your** Render/GitHub/Neon accounts. No account login or deployment token is available in the preview environment, so a permanent Render site has not been created on your behalf. A sandbox preview URL is temporary, not a permanent hosting/domain guarantee.

**Recommended hobby setup:** Render Free web service + Neon Free PostgreSQL. Render assigns an HTTPS subdomain such as `your-service-name.onrender.com`. The exact name depends on availability; `ahad-raza.onrender.com` has not been reserved. This is a free subdomain, not ownership of a `.com` domain.

No UI changes are required.

## To authorize deployment from this coding environment

The automated deployment helper needs these **three** values. Set them in the project's secure environment/Secrets settings, not in this conversation:

| Variable | Where to get it |
| --- | --- |
| `RENDER_API_KEY` | [Render Account Settings → API Keys](https://dashboard.render.com/u/settings?add-api-key). Create a temporary key and revoke it after deployment. |
| `DEPLOY_REPO_URL` | The HTTPS URL of the repository containing this complete project. Push/upload the code first (step 1 below). For a private repository, connect its Git provider to Render and grant repository access. |
| `DEPLOY_DATABASE_URL` | A **new hosted** PostgreSQL database's direct/non-pooled connection URL, e.g. Neon Free (step 2 below). Keep SSL parameters. Do not replace the sandbox's existing `DATABASE_URL`. |

Optional: set `RENDER_OWNER_ID` to the workspace ID shown in Render Settings if your API key can access multiple workspaces. `DEPLOY_SERVICE_NAME` defaults to `ahad-raza-portfolio`; the requested free subdomain is subject to availability. `DEPLOY_BRANCH` can specify a branch; otherwise the provider uses the repository's default branch.

If secure environment settings are not available in your editor/platform, use `.env.deploy` **on your own trusted computer**. Copy `.env.deploy.example` to `.env.deploy` and fill it privately. Both Git and Docker exclude real `.env.*` credential files.

After the three values are configured:

```sh
# Validate without sending credentials or creating anything.
node scripts/deploy-render.mjs --dry-run

# Create a Free Docker service and wait for its public database healthcheck.
node scripts/deploy-render.mjs --wait
```

Node.js 22 and the project's installed dependencies are required for this helper (`npm install` on your own computer first). The helper uses Render's documented REST API; it does not need your account password or a GitHub access token. Its repository must already exist, contain the prepared deployment files, and be accessible to Render. It does not upload source code or make a private repository public.

The helper:

- Creates only a **Free** web service. It never upgrades plans, buys a domain, or creates a paid database.
- Has Render generate `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`; read the password in the Render dashboard, not tool logs.
- Reuses an exactly matching existing service without overwriting settings/passwords or starting duplicate builds. Push new code to its connected branch to redeploy.
- Prints the actual provider-assigned `onrender.com` address and only says **Verified live** after the deployment is live **and** `/api/health` succeeds.
- Stops on account-access, verification, payment, or build errors; never auto-accepts a paid fallback.
- Does not transfer preview database contents. Use a new hosted database or handle a migration baseline deliberately.

An API key alone is not enough: the repository and persistent database must also be available. Use the dashboard Blueprint flow below instead if you prefer not to issue a deployment key. The two flows are alternatives; do not create duplicate services with both.

### Offline deployment-helper tests

```sh
node --test scripts/deploy-render.test.mjs
```

These use fake credentials and mocked HTTP responses; they do not create real hosting resources. Without actual account credentials, tests are not proof of a permanent deployment.

## 1. Put the project in your GitHub account

Create an empty GitHub repository, e.g. `ahad-portfolio`, and upload/push the complete project.

Include:

- `src/`, `scripts/hosted-start.mjs`, and the complete `drizzle/` folder.
- `Dockerfile`, `.dockerignore`, and `render.yaml`.
- `package.json` and **`package-lock.json`**.
- The Next.js, TypeScript, PostCSS, and Drizzle configuration files.

Never upload `.env`, `.env.local`, `.env.docker`, database backups, `node_modules/`, or `.next/`. `.gitignore` already excludes them. Keep only the blank example environment templates.

If using Git on your computer (replace the repository URL with your actual one):

```sh
git init
git add .
git status
# Review the staged files and make sure no credentials/backups are included.
git commit -m "Prepare portfolio for free deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ahad-portfolio.git
git push -u origin main
```

If a repository/remote already exists, use it instead of reinitializing or adding a duplicate remote.

## 2. Create the persistent free database

1. Open [Neon](https://console.neon.tech/signup) and create an account.
2. Select the **Free** plan and create a new, empty PostgreSQL project.
3. Choose a region close to your web service. This Blueprint uses Render's Singapore region; choose the nearest supported Neon region.
4. Click **Connect**. Select a **direct/non-pooled** connection (turn off connection pooling for this URL).
5. Copy the PostgreSQL URL exactly as Neon provides it, including its SSL parameters.

This private URL will be entered in Render, not committed to Git. Do not use `localhost`, the Docker hostname `db`, or the preview database URL: those are not reachable from Render.

Using Neon avoids Render Free PostgreSQL's current 30-day expiration. Neon Free is still usage-limited; review its [pricing](https://neon.com/pricing) and dashboard quotas.

## 3. Deploy the Blueprint

1. Open the [Render dashboard](https://dashboard.render.com/) and sign in.
2. Choose **New → Blueprint**.
3. Connect the GitHub repository from step 1 and allow Render access.
4. Render reads `render.yaml`; confirm the web service has the **Free** plan. This file does not request a paid service or a Render database.
5. When prompted for **`DATABASE_URL`**, paste your direct Neon PostgreSQL URL.
6. Approve/create the Blueprint. Render builds the Docker image and deploys it.

The file automatically configures:

| Setting | Value |
| --- | --- |
| Runtime | Docker |
| Plan | Free |
| Dockerfile | `./Dockerfile` |
| Docker Command | `node scripts/hosted-start.mjs` |
| Health check | `/api/health` |
| Port | `10000`, listening on `0.0.0.0` |
| Admin cookies | Secure (HTTPS only) |
| Admin password | Generated randomly by Render |
| Session signing secret | Generated randomly by Render |
| Updates | Deploy on commits to your connected branch |

The startup command applies checked-in migrations and only starts Next.js if they succeed. Free Render services lack separate one-off jobs/shell access, so you do not need to run a manual migration command on the host.

If deploying a Web Service manually instead of using a Blueprint, choose Docker + Free, set the Docker Command and environment variables above, and generate your own long unique admin password and signing secret. Do not leave the default Docker Command unchanged: that would skip initial migrations.

## 4. Open the website and sign in

Once Render reports **Live**, use the HTTPS URL displayed on the service page. Render automatically configures its `onrender.com` subdomain and TLS certificate; you do not need to buy a domain, configure DNS, or run Caddy for this path.

- Website: `https://YOUR_ASSIGNED_SERVICE.onrender.com`
- Private CMS: `https://YOUR_ASSIGNED_SERVICE.onrender.com/admin/login`
- Database health check: `https://YOUR_ASSIGNED_SERVICE.onrender.com/api/health`

In Render, open the service's **Environment** section and reveal **`ADMIN_PASSWORD`** to retrieve your generated password. The earlier preview password and Docker-local password do not apply to this deployment. There is no username.

After Render assigns the service URL, optionally set `SITE_URL` in the service's Environment section to that exact HTTPS URL. Render's external URL is detected automatically, but an explicit value keeps canonical links and the sitemap tied to your chosen public address.

Do not copy the generated password or session secret into a public file. To change a password, edit the environment variable in Render and redeploy; existing sessions are invalidated.

Admin links remain hidden from the public UI. Hiding links is not access control: the login screen still exists and server-side authentication protects the dashboard/API.

## 5. Add your real projects

The new Neon database is separate from the preview and starts empty. Log in and add projects/source files through the CMS. They remain in PostgreSQL across web-service restarts and redeploys.

Preview data is not transferred automatically. Do not restore an old full schema over the new migrated database without handling its migration history deliberately. For a database created with `drizzle-kit push`, transfer public-table data only to a matching empty migrated schema or obtain a migration baseline first. See `DOCKER.md` for backup/restore cautions.

Only publish source files you have the right to share. Never upload `.env` files, keys, or confidential employer code.

## Free-tier limitations — read before choosing this for your live portfolio

- This is intended for a hobby/low-traffic portfolio, not a production availability guarantee. Render explicitly advises against Free instances for production applications.
- Render currently sleeps after **15 minutes without incoming traffic**. The next visitor may see a loading screen while it wakes, usually around a minute.
- Free instance hours, build minutes, bandwidth, and Neon database compute/storage quotas apply. Reaching quotas can suspend service or require an upgrade. Check usage dashboards and avoid enabling paid upgrades without reviewing charges.
- Persistent Render disks are not included on Free. This app stores projects/code in Neon, not the ephemeral container filesystem.
- Long code repositories can consume database storage quickly. Keep source uploads reasonable and maintain your own database backups.
- Render's health checks query PostgreSQL. Do not add artificial keep-alive traffic to work around free-tier sleep; frequent queries can consume the database compute quota.
- Provider pricing and availability can change. Verify the Free plan in both dashboards at signup. Account verification may be required.
- The HTTPS endpoint protects transport, not against brute-force attempts. Add suitable login rate limiting before exposing a password-only admin to significant public traffic.

## Updates and troubleshooting

- Push code changes to your connected Git branch; Render builds and redeploys automatically.
- Generate/review schema migrations in development and commit the full `drizzle/` folder with each schema change. The hosted startup applies only pending migrations.
- Never delete old migration files after deploying. Startup uses migration history to skip already-applied SQL.
- Back up data before schema changes. Reverting an app image does not reverse an already-applied database migration.
- **No public address yet:** the YAML file is only a deployment definition; finish creating the Blueprint in your Render account.
- **Build failure:** check Render build logs. Confirm `package-lock.json` is in the repository and the full source/configuration was uploaded.
- **Database startup error:** verify the direct Neon URL, role/password, SSL parameters, and that the database/project is active.
- **Direct Neon URL warning:** use a URL whose hostname does not contain `-pooler`. If the app uses a pooled `DATABASE_URL`, set **`MIGRATION_DATABASE_URL`** to a direct URL in Render's Environment section; session-level migration locks must not run through a transaction-mode pooler.
- **Table already exists:** the database was initialized without migration history. Use a fresh database or baseline deliberately; the startup never drops your existing tables automatically.
- **First visit is slow:** free-service sleep is expected; use paid always-on hosting if fast first visits are important.
- **Login cookie fails:** use the assigned HTTPS address, keep `ADMIN_COOKIE_SECURE=true`, and allow first-party cookies.

## Official references

- [Render free-service limits](https://render.com/docs/free)
- [Render Blueprint specification](https://render.com/docs/blueprint-spec)
- [Render Docker deployments](https://render.com/docs/docker)
- [Neon Free plan and quotas](https://neon.com/pricing)

## Validation status

The development environment can validate YAML/startup logic, migrations, Next.js types, the production build, and the managed preview. It has no Docker engine or connected Render/Neon account, so it cannot claim a domain or verify a real Render image deployment. Confirm the service is **Live** in your own dashboard before treating the assigned URL as deployed.
