# Project Setup

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for the database)

---

## Environment Variables

Before running anything, create the required `.env` files by copying the provided examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then fill in the values in each `.env` file accordingly.

---

## Setup

### 1. Database

Start the PostgreSQL database via Docker:

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Run Migrations

After the database is running, apply the schema:

```bash
cd backend
npm run db:migrate
```

> **Note:** This step is required on first setup or after pulling changes that include new migrations.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## .env Examples

### `backend/.env.example`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=3000
NEXT_PUBLIC_GA_ID=G-XXXXXXX
NEXT_PUBLIC_VERCEL_ENV=development
```

### `frontend/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```