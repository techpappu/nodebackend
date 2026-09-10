# Secure Note-Taking API

A compact, production-style REST API using Node.js, TypeScript, Express, MongoDB/Mongoose, JWT, and bcrypt.

## Setup

1. Install Node.js 20 or newer and run `npm install`.
2. Copy `.env.example` to `.env` and provide a MongoDB Atlas URI and a strong JWT secret.
3. Run `npm run dev`. The API defaults to `http://localhost:5000`.

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Create the first admin by registering normally, then changing that user's `role` to `ADMIN` directly in Atlas. Public registration deliberately cannot assign roles. After that, admins can create other admins through `POST /users`.

## Authentication

Send the token returned by register/login as `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a user |
| POST | `/auth/login` | Public | Login |
| GET | `/auth/me` | User | Current profile |
| POST | `/notes` | User | Create own note |
| GET | `/notes?page=1&limit=10` | User | Own notes; admins see all |
| GET/PUT/DELETE | `/notes/:id` | User | Own note; admins can access all |
| GET/POST | `/users` | Admin | Paginated list/create users |
| PUT/DELETE | `/users/:id` | Admin | Update/delete a user |
| GET | `/users/group/interests?page=1&limit=10` | Admin | Paginated interest groups using one aggregation |
| POST | `/posts` | User | Create a public post |
| GET | `/users/:id/posts` | Public | User and posts through one `$lookup` pipeline |
| GET | `/health` | Public | Health check |

All list endpoints default to page 1 and 10 records and enforce a maximum limit of 100.

## Example flow

Register:

```http
POST /auth/register
Content-Type: application/json

{"name":"Sam","email":"sam@example.com","password":"correct-horse-42","interests":["coding","music"]}
```

Create a note:

```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{"title":"Private idea","content":"Only I (or an admin) can access this."}
```

Success responses use `{ "success": true, "data": ... }`. List responses also include `pagination`. Errors use `{ "success": false, "message": "..." }`.

## Security and data design

- Passwords are hashed with bcrypt (cost 12), excluded from normal queries, and removed during JSON serialization.
- Login failures intentionally use one generic message. JWTs contain only user ID and role; every request reloads the user so deleted accounts and role changes take effect.
- Note ownership is part of each MongoDB filter, preventing cross-user read or mutation.
- Request bodies, ObjectIds, emails, password length, and pagination are validated.
- Helmet, a JSON body-size limit, centralized errors, and graceful shutdown are enabled.
- Indexes match query patterns: unique user email, interests, user creation order, note owner/latest ordering, and post owner.

## Verification

```powershell
npm run typecheck
npm test
npm run build
```

The included Postman collection covers registration, login, profile, note CRUD, post creation, public `$lookup`, admin management, pagination, and interest grouping. It stores returned IDs and tokens automatically. Select your own admin token in the collection variable after bootstrapping an admin.
