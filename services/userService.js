const pool = require('../db/pool');

async function encontrarUsuario(email) {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  client.release();
  return result.rows[0];
}

async function criarUsuario(nome, email, senhaHash) {
  const client = await pool.connect();
  await client.query(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)',
    [nome, email, senhaHash]
  );
  client.release();
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

module.exports = {
  encontrarUsuario,
  criarUsuario,
  excluirUsuario,
  encontrarUsuarioPorId,  // <- adiciona aqui
};


module.exports = {
  encontrarUsuario,
  criarUsuario,
  excluirUsuario,
  encontrarUsuarioPorId
};
