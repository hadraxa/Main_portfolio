# Ahad Raza Portfolio — Setup & Admin Guide

## Want a free public HTTPS address?

See **[FREE_DEPLOY.md](./FREE_DEPLOY.md)** for the ready-to-deploy Render + Neon setup. It assigns a free `onrender.com` subdomain after you connect your own hosting/repository accounts. `render.yaml` selects the Free web-service plan and generates private admin credentials. Account creation and deployment approval must be completed by you; the file alone does not publish a permanent site.

## Prefer Docker?

See **[DOCKER.md](./DOCKER.md)** for an entirely containerized setup: Next.js + all npm dependencies, PostgreSQL, automatic database migrations, persistent storage, and an optional HTTPS proxy. Only Docker/Compose is required on your host. The Docker setup uses its own `.env.docker` and database volume, without changing this site's UI or the existing local/preview configuration.

## Admin access

The public website does not show admin links in the desktop navigation, mobile/tablet menu, footer, or project empty states.

- Open `/admin/login` directly on your website and bookmark it.
- Enter the password stored in `ADMIN_PASSWORD`.
- `/admin` takes you to the dashboard when signed in, or to the login screen otherwise.
- The admin pages include `noindex, nofollow` metadata, and `robots.txt` requests that crawlers skip admin/API paths.

**Hiding links is not a security boundary.** Someone who knows the URL can still open the login screen, but must authenticate to manage content.

## 1. Requirements

- Node.js 22 LTS and npm.
- A running PostgreSQL database (local or hosted).
- An empty database for this app, for example `app_db`.

Install the project dependencies from the project root:

```sh
npm install
```

## 2. Configure your environment

On a fresh copy of the project:

```sh
cp .env.example .env.local
```

On Windows, copying and renaming `.env.example` to `.env.local` in File Explorer also works.

**If `.env.local` already exists, edit it instead of overwriting it.** The preview already has its own admin configuration.

Fill in these values:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | The PostgreSQL connection URL for your database. Use your provider's SSL options if required. |
| `ADMIN_PASSWORD` | Your own long, unique admin password. Change the preview password before publishing. |
| `ADMIN_SESSION_SECRET` | A random signing secret, at least 32 characters long. Do not reuse your password. |

Generate a session secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy that output into `ADMIN_SESSION_SECRET`. Do not share it.

Next.js automatically loads `.env.local`. Drizzle's configuration reads it too, with `.env` as a fallback. Hosting environment variables take precedence over both files.

Never put these secrets in `NEXT_PUBLIC_*` variables or in `public/`. `.gitignore` excludes environment files; only the blank `.env.example` template should go into Git.

## 3. Create the database tables

After PostgreSQL is running and `DATABASE_URL` is set:

```sh
npx drizzle-kit push
```

This creates the `projects` and `project_files` tables from `src/db/schema.ts`. Review any prompts before accepting changes, especially on a database with existing content.

Use a dedicated database and back it up before changing the schema in production. The app does not create tables automatically when it starts.

## 4. Run locally

```sh
npm run dev
```

The development server uses Webpack to avoid Turbopack junction-creation failures on some Windows setups.

- Public portfolio: `http://localhost:3000`
- Private login: `http://localhost:3000/admin/login`

If port 3000 is occupied, use the address printed by Next.js.

## 5. Add your projects

1. Sign in at `/admin/login`.
2. Choose **New project**.
3. Fill in the title, description, tags, cover, README, and optional demo/repository URLs.
4. Upload text source files or add them manually. Set paths such as `src/index.ts` to create folders in the public code browser.
5. Enable **Featured** to show the project on the homepage.
6. Save, then use **View** to open the public project page.

Projects and code files are stored in PostgreSQL, not in the app's temporary filesystem. Changes appear on the public pages after saving.

**Only upload code that is safe to publish.** Do not upload `.env` files, API keys, private keys, passwords, confidential workplace code, or personal data. Existing demo projects are examples: edit or remove them rather than presenting unverified sample accomplishments as your own work.

Your bio/contact/experience are in `src/lib/site.ts`. Detailed skill descriptions are in `src/lib/skillsData.ts`. The dashboard currently manages projects and source files, not your entire CV.

## 6. Deployment

This is a full-stack Next.js app. It requires a Next.js-compatible Node.js/serverless host and a persistent PostgreSQL database. **Surge/static-only hosting cannot run the admin CMS and database-backed routes.**

1. Create a production PostgreSQL database and set its `DATABASE_URL` in your hosting environment.
2. Set a strong `ADMIN_PASSWORD` and a new random `ADMIN_SESSION_SECRET` on the host. Do not keep the preview password.
3. Apply the schema to the production database with `npx drizzle-kit push` using its connection URL. Review changes before applying.
4. Use `npm run build` as the build command. For a self-hosted Node.js server, use `npm run start` after building. Managed Next.js hosts handle startup themselves.
5. Enable HTTPS: production admin cookies are marked `Secure`.
6. Confirm `/api/health` responds with `{"ok":true}`.
7. Bookmark `https://your-domain/admin/login`; no public admin navigation is displayed.

The preview's database contents are not automatically copied to a new production database. Add real projects through the CMS or transfer them using a PostgreSQL backup/restore.

## Password changes and logout

- Locally: change `ADMIN_PASSWORD` in `.env.local` and restart the app.
- On a host: change the server environment variable and redeploy/restart.
- Changing the password or signing secret invalidates existing sessions.
- Sessions also expire after 30 days. Use **Log out** in the dashboard when finished.
- Add host-level rate limiting for the login path before making a password-only admin publicly available. The current app does not provide a distributed login-attempt limiter.

## Troubleshooting

- **Database connection failed:** Check that PostgreSQL is running and `DATABASE_URL` targets the correct database.
- **Table does not exist:** Run `npx drizzle-kit push` against that same database.
- **Cannot log in:** Check the password in the active server environment, then restart after changing it.
- **Signing-secret error:** Set `ADMIN_SESSION_SECRET` to a generated value of at least 32 characters.
- **Login does not persist on a deployed site:** Use HTTPS and allow first-party cookies.
- **New deployment has no projects:** The new database is empty; production data must be entered or transferred separately.
