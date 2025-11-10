const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// 🧪 Función para probar la conexión
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();

    console.log(`✅ Conexión exitosa a PostgreSQL (${result.rows[0].now})`);
    return true;
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error.message);
    return false;
  }
}

module.exports = {
  pool,
  query: pool.query.bind(pool),
  testConnection,
};
