# Timekeeper

Full‑stack time recording app with separate frontend and backend.

## Backend

1. Navigate to `backend`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres connection (e.g. Docker container).
3. Run `npm install`.
4. Initialize database: run `psql $DATABASE_URL -f db/init.sql` or use the script.
5. Start server: `npm run dev` (requires nodemon) or `npm start`.

API listening on port 3001 by default.

## Frontend

1. Navigate to `frontend`
2. Run `npm install`.
3. Start dev server: `npm run dev`.
4. The development server proxies `/api` to backend, so ensure backend is running.

The UI lets you enter date, times, comments, and tasks. It posts to `/api/entries`.

- Entries are shown one week at a time, starting on Monday. Use the "Previous week" / "Next week" buttons to page through.
- Each row displays the daily duration (morning + afternoon) and the weekly total appears at the bottom.

> You can run a Docker Postgres container:
> ```
> docker run --name timekeeper-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
> ```


## Notes

- Feel free to expand routes (GET entries, weekly totals, etc.)
- The frontend is a minimal React/Vite setup; build for production with `npm run build`.

## Docker quick start

The repository includes a `docker-compose.yml` that will start a Postgres container:

```sh
docker-compose up -d
```

The database will be available at `postgresql://postgres:password@localhost:5432/timekeeper`. You can then run the SQL initializer:

```sh
docker exec -i $(docker ps -qf "name=mytimekeeper_db") psql -U postgres -d timekeeper -f /path/to/backend/db/init.sql
```

or simply use a local `psql` client against the mapped port.

