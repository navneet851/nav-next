const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const match = envContent.match(/DATABASE_URL="([^"]+)"/);
const dbUrl = match[1];

const pool = new Pool({ connectionString: dbUrl });

async function checkUsers() {
  try {
    const res = await pool.query('SELECT id, name, email, role FROM "user"');
    console.log("👥 Existing users:", res.rows);
  } catch (err) {
    console.error("Failed to query users:", err.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
