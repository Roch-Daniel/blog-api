# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS base

WORKDIR /app

FROM base AS deps

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

FROM deps AS dev
ENV NODE_ENV=development

COPY . .

CMD ["npm", "run", "dev"]

FROM deps AS test

RUN apt-get update \
    && apt-get install -y --no-install-recommends libcurl4 \
    && rm -rf /var/lib/apt/lists/*

COPY tsconfig.json jest.config.cjs ./
COPY src ./src
COPY tests ./tests

RUN --mount=type=secret,id=jwt_secret \
    JWT_SECRET="$(cat /run/secrets/jwt_secret)" npm test

FROM deps AS build

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM base AS prod-deps

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

USER nonroot

COPY --from=prod-deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /app/dist ./dist

EXPOSE 3000

CMD ["dist/src/index.js"]
