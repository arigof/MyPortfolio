# MyPortfolio | Final release

The React portfolio uses an Express API and MongoDB for account authentication, saved projects and qualifications, and contact submissions. The public portfolio pages remain available to visitors. Signed-in users can also open the database-backed lists.

## Run locally

Use Node.js 24 LTS (minimum 22.19, verified locally with Node.js 24.16), npm, and a running MongoDB instance. From the repository root:

```sh
npm ci
npm ci --prefix client
cp .env.example .env
openssl rand -hex 32
```

Paste the generated value into `JWT_SECRET` in the root `.env`, set the MongoDB URI, and supply a unique administrator password. Keep `.env` local. For development, use a separate database from any live portfolio data.

| Variable | Purpose |
| --- | --- |
| `PORT` | Express port, default `5000`. |
| `MONGODB_URI` | MongoDB URI including the database name. The example points to local MongoDB. |
| `JWT_SECRET` | Private signing key of at least 32 characters. Generate it per environment. |
| `ADMIN_NAME` | Display name used by the seed command. |
| `ADMIN_EMAIL` | Email used to sign in as the seeded administrator. |
| `ADMIN_PASSWORD` | Private initial password for the seed command, 8 characters minimum and 72 bytes maximum. |
| `API_PROXY_TARGET` | Optional environment variable for the Vite process, default `http://127.0.0.1:5000`. Set it when using another API port. |

Seed the administrator once, then run the API and frontend in separate terminals:

```sh
npm run seed:admin
npm start
```

```sh
npm --prefix client run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. If you set `PORT` to a different value, use e.g. `API_PROXY_TARGET=http://127.0.0.1:5500 npm --prefix client run dev`. Run `npm --prefix client run lint` and `npm --prefix client run build` for client checks. In deployment, serve the frontend and proxy `/api` to Express on the same origin over HTTPS. Configure your frontend host to fall back to `index.html` for React routes.

The seed script uses the existing User model and its bcrypt save hook. An existing administrator is left as-is on repeat runs, and the script rejects an email already assigned to a regular account. Changing the seed password in the environment does not rotate an existing password. MongoDB stores the hash in the User model’s `password` field. Public registration always assigns `user`. Existing accounts without an explicit role have regular-user permissions.

## Authentication and access

`POST /api/auth/signup` creates an account and signs it in. `POST /api/auth/signin` verifies its password. Both return the user profile and a JWT access token valid for one hour. The frontend stores the token, profile, and expiry in the current tab's `sessionStorage` under `portfolio.session`. It sends the token as `Authorization: Bearer <token>` for protected requests. Express verifies the signature, issuer, audience, and expiry, then reads the account and its current role from MongoDB. The backend returns `401` for missing or invalid authentication and `403` for a signed-in user without the required role.

The Sign out button attempts `POST /api/auth/signout`, clears the saved session and in-memory state immediately, and takes the browser to Home. The endpoint acknowledges with `204` and does not revoke tokens. Any existing copy remains usable until expiration while the account exists. The frontend also clears expired sessions and prompts the user to sign in again.

| Access | Visitor | Regular user | Administrator |
| --- | --- | --- | --- |
| Public portfolio, sign-up, sign-in | Yes | Yes | Yes |
| Submit the public contact form | Yes | Yes | Yes |
| Read saved projects and qualifications | — | Yes | Yes |
| Create, edit, and delete saved projects and qualifications | — | — | Yes |
| Read and manage saved contacts or user accounts through the API | — | — | Yes |

The public portfolio contact form sends to `POST /api/contact-submissions`. Its response contains a confirmation and a reference ID. The assignment’s read-only role applies to saved projects and qualifications. Saved contact names, email addresses, phone numbers, and messages are private. Only administrators can retrieve them or manage them at `/admin/contacts` and `/api/contacts`. Regular users cannot access contact records even by calling the API directly.

For projects, qualifications, and saved contacts, use `GET /api/<resource>` to list records, `GET /api/<resource>/<id>` for one record, `POST /api/<resource>` to create, and `PUT` or `DELETE /api/<resource>/<id>` to update or delete. PUT accepts the complete editable record. Projects and qualifications require `title`, `completionDate` (YYYY-MM-DD), and `description`. Contacts use `firstName`, `lastName`, `email`, `phone`, and `message`. Phone and message are required for the public form and optional when managing contacts. The administrator can find a public submission using its reference ID in the API.

## Verification procedure

1. Run the API and frontend against a disposable MongoDB database. Use synthetic identities and contact details.
2. In an API testing tool such as curl or Postman, submit a sign-up and sign-in. Use the returned token in subsequent requests. Verify that supplying `role: "admin"` during public sign-up still creates a regular user.
3. Try reading `/api/projects` without a token (401), with a regular token (200), and writing with that token (403). Verify that regular users cannot retrieve saved contacts.
4. Sign in as the seeded administrator. Create, retrieve, edit, and delete a sample contact, qualification, and project. Verify that deleted records return 404.
5. Submit the React contact form. Record the returned reference ID, read `/api/contacts/<id>` as admin, and compare its data with the document having the same `_id` in MongoDB.

## Final release tests

Run the component tests with **npm run test:unit**, or **npm --prefix client run test:report** to save JSON and an official Vitest HTML report.

- Contact.test.jsx checks whitespace validation without a request, the disabled sending state, trimmed submission data, the success reference and cleared fields, and an API error that preserves input for retry.
- AuthForm.test.jsx checks missing registration fields and failed sign-in without accepting a session.
- Component tests mock only the API boundary. They run in jsdom with Vitest and Testing Library.

After building with **npm run build**, run **TEST_MONGO_URL=mongodb://127.0.0.1:27017 npm run test:e2e**. Use a local, isolated MongoDB server. Cypress runs Chrome, records an MP4, and saves screenshots and JSON totals under **evidence/**. No Cypress Cloud subscription or record key is needed.

The E2E runner generates a unique database named portfolio_test_ followed by random bytes, seeds a synthetic administrator, runs the real Express app and built React app, and removes only that generated database in a finally block. It refuses non-local MongoDB hosts and checks the server's unique run marker before testing. Keep port 5615 available. The production database and root .env are not used by tests.

The three Cypress tests cover registration and reader restrictions; contact submission and a direct MongoDB comparison; admin CRUD through React and API, refresh persistence, regular-user read access, sign-in/out and route guards; and a 390px mobile layout. Passwords are generated per run, typed with logging disabled, and passed to Node-side tasks. API requests with tokens also disable command logging. Records use example.test identities.

**AI-use disclosure.** OpenAI Codex assisted with writing the component tests, Cypress tests, isolated database runner, configuration, and verification steps. It ran the local suites and inspected their output. These tests were AI-assisted and should be reviewed and demonstrated by the student. The component tests verify client behavior against a mocked API; the E2E suite checks the real app and MongoDB. Cloud deployment checks require a configured hosting account and cloud database.

## Production hosting and CI/CD

The final release can serve React and the API from one Render web service, keeping requests on the same HTTPS origin. **render.yaml** declares a free web service and a database-aware health check. MongoDB must be hosted separately, for example on Atlas.

Before creating services, sign in to Render and MongoDB Atlas and review the selected plans and any requested billing details. The files do not authorize paid upgrades. Use an Atlas database user scoped to the portfolio database and allow the hosting service's outbound IPs. Set **MONGODB_URI** in Render's secret environment settings. Render generates **JWT_SECRET**. Never add either value to GitHub.

Use the main branch. The service installs both package-lock files, builds React, then starts Express. React route requests return index.html, /api stays on the backend, and hashed /assets files have long-lived cache headers. **/api/health** returns 200 only while MongoDB is connected and includes the deployed commit identifier.

For separate frontend hosting, set **VITE_API_URL** to the backend HTTPS URL ending in /api at frontend build time. Set **FRONTEND_ORIGINS** on the backend to a comma-separated list of exact allowed frontend origins. The single-service setup needs neither value. JWTs still expire after one hour and sign-out still removes the current tab's token without revoking other copies.

To seed production once, run **npm run seed:admin** from a trusted machine or platform shell with the production MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET supplied privately as environment variables. Remove temporary admin seed variables afterward. The seed command does not rotate existing passwords.

**.github/workflows/release.yml** runs lint, unit tests, the production build, and Cypress against a disposable MongoDB 8 service on pull requests and pushes to main. Evidence is uploaded as a GitHub Actions artifact. Any failed required command fails the quality job. Configure the main branch to require that check before merging. Render's **After CI Checks Pass** setting (autoDeployTrigger: checksPass) waits for successful checks on main before deploying. Confirm this setting in the live service dashboard after connecting GitHub.

To demonstrate a deployment update, first capture the deployed Home page, then merge a small visible change through a pull request after checks pass. Verify the commit from /api/health, verify the updated Home page at the same viewport, and capture the after image. Check sign-in, admin writes, reader restrictions, a public contact submission, and refresh persistence on that deployed service. Local screenshots and local test results alone do not establish cloud deployment.


The proposed Render Free service has no compute charge but sleeps after 15 minutes without traffic, so the next request can take about a minute to wake it. Atlas offers a Free cluster (M0). Review plan details before creating resources and avoid paid upgrades. References checked for this release are https://render.com/docs/free and https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/. No hosting or Atlas resources were provisioned during local verification.

Performance evidence uses Lighthouse 13.6.0 against the Projects page in a production Vite preview at http://127.0.0.1:5614/projects, with three cold-cache mobile runs per version and simulated network/CPU throttling. Original JPEGs were converted to smaller WebP assets; later project images load lazily, and intrinsic dimensions reserve their space. The README and submitted report distinguish local measurements from future deployed measurements. To rebuild assets, install Pillow in a development Python environment and run python scripts/optimize-images.py.
