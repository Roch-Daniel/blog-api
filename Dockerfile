FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm test

RUN npm run build

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "dist/src/index.js"]