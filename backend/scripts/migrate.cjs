const fs = require("node:fs/promises");
const path = require("node:path");
const pg = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/farm_nft";
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const migrationPath = path.resolve(__dirname, "../migrations/001_init.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  await pool.query(sql);
  await pool.end();
  console.log("Database migration completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
