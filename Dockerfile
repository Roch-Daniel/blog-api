FROM node:20-bookworm-slim AS base

WORKDIR /app

FROM base AS deps

COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS test

ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

RUN apt-get update \
    && apt-get install -y --no-install-recommends libcurl4 \
    && rm -rf /var/lib/apt/lists/*

COPY tsconfig.json jest.config.cjs ./
COPY src ./src
COPY tests ./tests
RUN npm test

FROM deps AS build

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM base AS prod-deps

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    PATH=/nodejs/bin

COPY --from=prod-deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /app/dist ./dist

EXPOSE 3000

CMD ["dist/src/index.js"]
