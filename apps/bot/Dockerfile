FROM oven/bun:1.3.14

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

ENV NODE_ENV=production
EXPOSE 8080

CMD ["bun", "apps/bot/src/index.ts"]
