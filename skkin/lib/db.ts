import postgres from "postgres";

// Base Postgres facultative (ex. Neon gratuit) : utile chez les hébergeurs sans disque permanent.
let client: postgres.Sql | null = null;
let ready: Promise<void> | null = null;

export function dbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function db(): Promise<postgres.Sql> {
  client ??= postgres(process.env.DATABASE_URL!, { max: 5, idle_timeout: 20, onnotice: () => {} });
  ready ??= (async () => {
    await client!`create table if not exists skkin_store (id int primary key, data jsonb not null)`;
    await client!`create table if not exists skkin_uploads (name text primary key, type text not null, data bytea not null)`;
  })();
  await ready;
  return client;
}
