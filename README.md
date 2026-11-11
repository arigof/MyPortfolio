# MyPortfolio | Assignment 3

The React portfolio uses an Express API and MongoDB for account authentication, saved projects and qualifications, and contact submissions. The public portfolio pages remain available to visitors. Signed-in users can also open the database-backed lists.

## Run locally

Use Node.js 22.12+ (verified with Node.js 24), npm, and a running MongoDB instance. From the repository root:

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
