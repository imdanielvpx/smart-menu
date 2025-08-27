# Smart Menu SaaS

## Setup

```bash
pnpm install
docker compose up -d
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```
