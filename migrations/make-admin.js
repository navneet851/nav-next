const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const match = envContent.match(/DATABASE_URL="([^"]+)"/);
const dbUrl = match[1];

const pool = new Pool({ connectionString: dbUrl });

async function makeAdmin() {
  try {
    await pool.query('UPDATE "user" SET role = \'admin\'');
    console.log("✅ All users updated to role: 'admin'!");
  } catch (err) {
    console.error("Failed to update users:", err.message);
  } finally {
    await pool.end();
  }
}

makeAdmin();
