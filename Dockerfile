FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1 AS run

ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/drizzle ./drizzle
RUN ulimit -c unlimited
ENTRYPOINT ["bun", "./build/index.js"]