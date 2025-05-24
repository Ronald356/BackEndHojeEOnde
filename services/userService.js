const pool = require('../db/pool');

async function encontrarUsuario(email) {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
}

async function criarUsuarioGoogle(nome, email, googleId) {
  const client = await pool.connect();
  await client.query(
    'INSERT INTO usuarios (nome, email, google_id) VALUES ($1, $2, $3)',
    [nome, email, googleId]
  );
  client.release();
}

async function criarUsuario(nome, email, senhaHash) {
  const client = await pool.connect();
  await client.query(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)',
    [nome, email, senhaHash]
  );
  client.release();
}

async function encontrarUsuarioPorGoogleId(googleId) {
  const result = await pool.query('SELECT * FROM usuarios WHERE google_id = $1', [googleId]);
  return result.rows[0];
}

async function excluirUsuario(id) {
  const query = 'DELETE FROM usuarios WHERE id = $1';
  await pool.query(query, [id]);
}

async function encontrarUsuarioPorId(id) {
  const query = 'SELECT * FROM usuarios WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

const crypto = require('crypto');

async function gerarCodigoVerificacao(email) {
  const codigo = crypto.randomInt(100000, 999999).toString(); // código numérico 6 dígitos

  const validade = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos a partir de agora

  await pool.query(
    'INSERT INTO codigos_verificacao (email, codigo, validade) VALUES ($1, $2, $3)',
    [email, codigo, validade]
  );

  return codigo;
}

async function verificarCodigo(email, codigo) {
  const result = await pool.query(
    'SELECT * FROM codigos_verificacao WHERE email = $1 AND codigo = $2 AND validade > NOW()',
    [email, codigo]
  );

  return result.rows.length > 0;
}



module.exports = {
  encontrarUsuario,
  criarUsuario,
  excluirUsuario,
  encontrarUsuarioPorId,  // <- adiciona aqui
    criarUsuarioGoogle,       // Adicionado para Google
  encontrarUsuarioPorGoogleId,
  gerarCodigoVerificacao,
  verificarCodigo
};
