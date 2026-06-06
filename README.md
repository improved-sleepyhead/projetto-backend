# Projetto Backend

Projetto Backend is a NestJS API for a small Jira-like project tracker. It
provides authentication, users, projects, project roles, invite links, tasks,
task ordering, comments, and Swagger documentation.

The backend uses:

- NestJS 11
- Prisma ORM
- PostgreSQL
- JWT authentication with refresh-token cookies
- Swagger at `/api/docs`

## Requirements

- Docker and Docker Compose
- Node.js 22 only if you want to run the API outside Docker

## Quick Start With Docker

Start PostgreSQL and the API:

```bash
docker compose up --build
```

The API will be available at:

- API base URL: `http://localhost:4200/api`
- Swagger UI: `http://localhost:4200/api/docs`
- PostgreSQL: `localhost:5433`

The app container runs these startup steps automatically:

1. `npx prisma generate`
2. `npx prisma migrate deploy`
3. `npm run start:dev`

Stop the stack:

```bash
docker compose down
```

Stop the stack and remove the database volume:

```bash
docker compose down -v
```

## Environment

Docker Compose provides development defaults:

```env
PORT=4200
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-change-me
BASE_URL=http://localhost:4200
DATABASE_URL=postgresql://projetto:projetto@db:5432/projetto?schema=public
```

For non-Docker local runs, create your own `.env` with a local `DATABASE_URL` and
`JWT_SECRET`.

To connect to the Compose database from the host, use:

```env
DATABASE_URL=postgresql://projetto:projetto@localhost:5433/projetto?schema=public
```

## Local Run Without Docker

Install dependencies:

```bash
npm install
```

Generate Prisma Client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Start the API:

```bash
npm run start:dev
```

## Useful Commands

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Build production bundle
npm run build

# Validate Prisma schema
npx prisma validate
```

## Main Modules

- `auth`: register, login, logout, JWT strategy, refresh-token cookies.
- `user`: profile, users, user-level access checks.
- `project`: project CRUD, memberships, roles, invite links.
- `task`: task CRUD, filtering, status/priority, board ordering.
- `comment`: task comments.
- `role`: project role assignment.
- `prisma`: PostgreSQL access through Prisma.
