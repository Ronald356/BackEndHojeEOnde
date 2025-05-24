const { Pool } = require('pg');

// Configurar o pool (mesma config que você usa no index.js)
// Pode importar de um arquivo comum se preferir, ou repetir aqui.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

async function salvarCodigo(email, codigo) {
  const client = await pool.connect();
  try {
    // Vamos salvar o código com uma data de expiração (15 min a partir de agora)
    const dataExpiracao = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await client.query(
      `INSERT INTO codigos_verificacao (email, codigo, data_expiracao)
       VALUES ($1, $2, $3)`,
      [email, codigo, dataExpiracao]
    );
  } finally {
    client.release();
  }
}

async function buscarCodigo(email) {
  const client = await pool.connect();
  try {
    // Buscar o código válido para esse email, que ainda não expirou
    const result = await client.query(
      `SELECT codigo FROM codigos_verificacao 
       WHERE email = $1 AND data_expiracao > NOW()
       ORDER BY data_expiracao DESC LIMIT 1`,
      [email]
    );
    return result.rows[0]?.codigo;
  } finally {
    client.release();
  }
}

module.exports = {
  salvarCodigo,
  buscarCodigo,
};
