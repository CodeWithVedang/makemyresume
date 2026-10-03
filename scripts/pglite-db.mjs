// Development/testing only: PostgreSQL compiled to WASM (PGlite), served over
// the Postgres wire protocol. Use when a native PostgreSQL server can't run
// (no Docker, restricted sandbox, CI without services). Single connection —
// use the DATABASE_URL below (pgbouncer=true disables prepared statements).
//
//   npm run db:pglite
//   DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5434/postgres?connection_limit=1&sslmode=disable&pgbouncer=true"
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.PGLITE_PORT ?? 5434);
const db = await PGlite.create(process.env.PGLITE_DATA_DIR ?? "./.pgdata-lite");
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 100 });
await server.start();
console.log(`PGlite ready: postgresql://postgres:postgres@127.0.0.1:${port}/postgres`);

const stop = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
