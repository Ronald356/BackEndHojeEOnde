require("./config");
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const fetch = require("node-fetch"); // importar node-fetch

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

// Variável para guardar o URL atual do Ngrok
let ngrokUrl = "";

// Função para buscar o endereço atual do Ngrok
async function atualizarNgrokUrl() {
  try {
    const res = await fetch("http://127.0.0.1:4040/api/tunnels");
    const data = await res.json();
    if (data.tunnels && data.tunnels.length > 0) {
      ngrokUrl = data.tunnels[0].public_url;
      console.log("Ngrok URL atualizada:", ngrokUrl);
    } else {
      console.log("Nenhum túnel ativo no Ngrok encontrado.");
    }
  } catch (error) {
    console.error("Erro ao pegar URL do Ngrok:", error.message);
  }
}

atualizarNgrokUrl();

// Sua rota para fornecer o endereço atual do Ngrok para o frontend
app.get("/ngrok-url", (req, res) => {
  if (ngrokUrl) {
    res.json({ url: ngrokUrl });
  } else {
    res.status(503).json({ error: "URL do Ngrok ainda não disponível" });
  }
});

// ✅ Suas rotas existentes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

app.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();

    res.json({ status: "Backend rodando", time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao conectar com o banco" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
