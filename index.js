require('./config'); // garante que as variáveis do .env carreguem antes de tudo
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// ✅ ADICIONE SUAS ROTAS AQUI
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Rota de teste
app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    res.json({ status: 'Backend rodando', time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao conectar com o banco' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
