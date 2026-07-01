# Stackd Frontend

Next.js App Router frontend for Stackd.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create `frontend/.env.local` when developing locally:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Production

Deploy this directory on Vercel with:

```env
NEXT_PUBLIC_API_URL=https://stackd-backend-4cb7.onrender.com
```

Only public frontend config belongs here. Backend secrets such as `DATABASE_URL`, API tokens, and email keys belong on the backend host.

## Checks

```bash
npm run lint
npm run build
```
