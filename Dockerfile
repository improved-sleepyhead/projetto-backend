FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS dev

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

EXPOSE 4200

CMD ["npm", "run", "start:dev"]

FROM node:22-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001

COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/package.json ./package.json

USER appuser

EXPOSE 4200

CMD ["node", "dist/main"]
