import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    console.log("Testing connection to:", process.env.DATABASE_URL);
    const res = await pool.query('SELECT NOW()');
    console.log("Success! Server time:", res.rows[0]);
  } catch (err) {
    console.error("FAILED TO CONNECT:");
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
