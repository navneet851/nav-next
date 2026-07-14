const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const envContent = fs.readFileSync(path.join(projectRoot, ".env.local"), "utf-8");
const match = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString: match[1] });

async function runMigration() {
  const sql = fs.readFileSync(
    path.join(__dirname, "org-role-migration.sql"),
    "utf-8"
  );

  try {
    await pool.query(sql);
    console.log("✅ organizationRole migration completed successfully!");
  } catch (err) {
    console.error("❌ organizationRole migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
