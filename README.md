<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Описание

Projetto Backend — это NestJS API для простого Jira-подобного трекера задач.
Сервис отвечает за регистрацию и вход пользователей, проекты, роли участников,
инвайт-ссылки, задачи, порядок задач на доске, комментарии и Swagger-документацию.

Стек проекта:

- NestJS 11
- Prisma ORM
- PostgreSQL
- JWT-аутентификация и refresh-token cookies
- Swagger UI на `/api/docs`

## Требования

- Docker и Docker Compose
- Node.js 22, если нужно запускать API без Docker

## Быстрый запуск через Docker

Поднять PostgreSQL и API:

```bash
docker compose up --build
```

После запуска будут доступны:

- API: `http://localhost:4200/api`
- Swagger UI: `http://localhost:4200/api/docs`
- PostgreSQL для подключения с хоста: `localhost:5433`

При старте контейнер приложения автоматически выполняет:

1. `npx prisma generate`
2. `npx prisma migrate deploy`
3. `npm run start:dev`

Остановить контейнеры:

```bash
docker compose down
```

Остановить контейнеры и удалить volume базы данных:

```bash
docker compose down -v
```

## Переменные окружения

Docker Compose задает dev-значения по умолчанию:

```env
PORT=4200
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-change-me
BASE_URL=http://localhost:4200
DATABASE_URL=postgresql://projetto:projetto@db:5432/projetto?schema=public
```

Для запуска без Docker создай свой `.env` с `DATABASE_URL` и `JWT_SECRET`.

Для подключения к базе из Compose с хоста используй:

```env
DATABASE_URL=postgresql://projetto:projetto@localhost:5433/projetto?schema=public
```

## Локальный запуск без Docker

Установить зависимости:

```bash
npm install
```

Сгенерировать Prisma Client и применить миграции:

```bash
npx prisma generate
npx prisma migrate deploy
```

Запустить API в watch mode:

```bash
npm run start:dev
```

## Полезные команды

```bash
# Unit-тесты
npm run test

# E2E-тесты
npm run test:e2e

# Production-сборка
npm run build

# Проверка Prisma-схемы
npx prisma validate
```

## Основные модули

- `auth`: регистрация, вход, выход, JWT strategy, refresh-token cookies.
- `user`: профиль, пользователи, проверки доступа на уровне пользователей.
- `project`: CRUD проектов, участники, роли, инвайт-ссылки.
- `task`: CRUD задач, фильтры, статус, приоритет, порядок на доске.
- `comment`: комментарии к задачам.
- `role`: назначение ролей в проекте.
- `prisma`: доступ к PostgreSQL через Prisma.
