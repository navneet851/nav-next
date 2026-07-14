const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
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
    path.join(__dirname, "org-admin-migration.sql"),
    "utf-8"
  );

  try {
    await pool.query(sql);
    console.log("✅ Migration completed successfully!");

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('organization', 'member', 'invitation', 'user', 'session')
      ORDER BY table_name;
    `);
    console.log("📋 Tables verified:", result.rows.map((r) => r.table_name));

    // Verify new columns on user
    const userCols = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'user' AND column_name IN ('role', 'banned', 'banReason', 'banExpires')
      ORDER BY column_name;
    `);
    console.log("👤 User columns added:", userCols.rows.map((r) => r.column_name));

    // Verify new columns on session
    const sessionCols = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'session' AND column_name IN ('activeOrganizationId', 'impersonatedBy')
      ORDER BY column_name;
    `);
    console.log("🔑 Session columns added:", sessionCols.rows.map((r) => r.column_name));
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
