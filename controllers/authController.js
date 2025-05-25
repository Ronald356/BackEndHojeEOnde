const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");
const nodemailer = require("nodemailer");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function registerUser(req, res) {
  const { email, senha, nome } = req.body;

  if (!email || !senha || !nome) {
    return res
      .status(400)
      .json({ error: "Por favor, informe nome, email e senha." });
  }

  try {
    const existingUser = await userService.encontrarUsuario(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Usuário já cadastrado com esse email." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    await userService.criarUsuario(nome, email, hashedPassword);

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function loginUser(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Por favor, informe email e senha." });
  }

  try {
    const user = await userService.encontrarUsuario(email);

    if (!user) {
      return res.status(401).json({ error: "Usuário ou senha incorretos." });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: "Usuário ou senha incorretos." });
    }

    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login realizado com sucesso!" });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function logout(req, res) {
  res.json({ message: "Logout realizado com sucesso!" });
}

async function excluirConta(req, res) {
  try {
    const { id } = req.user;
    const usuario = await userService.encontrarUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    await userService.excluirUsuario(id);
    res.json({ message: "Conta excluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function loginComGoogle(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token não fornecido." });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const nome = payload.name;

    let user = await userService.encontrarUsuario(email);

    if (!user) {
      await userService.criarUsuarioGoogle(nome, email, googleId);
      user = await userService.encontrarUsuario(email);
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token: jwtToken,
      message: "Login com Google realizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro no login com Google:", error);
    res.status(401).json({ error: "Token inválido ou erro ao autenticar." });
  }
}

async function enviarCodigoVerificacao(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  try {
    const usuarioExistente = await userService.encontrarUsuario(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const codigo = await userService.gerarCodigoVerificacao(email);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });

    await transporter.sendMail({
      from: `Hoje é onde? <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Código de Verificação",
      text: `Para continuar o cadastro é necessário informar o código de verificação: ${codigo}. Ele é válido por 10 minutos.`,
    });

    res.json({ message: "Código enviado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao enviar código" });
  }
}

async function validarCodigoVerificacao(req, res) {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: "Email e código são obrigatórios" });
  }

  try {
    const codigoValido = await userService.verificarCodigo(email, codigo);
    if (!codigoValido) {
      return res.status(400).json({ error: "Código inválido ou expirado" });
    }

    res.json({ message: "Código validado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao validar código" });
  }
}

async function loginComFacebook(req, res) {
  const { facebookId, email, name } = req.body;

  if (!facebookId || !email || !name) {
    return res
      .status(400)
      .json({ error: "facebookId, email e name são obrigatórios" });
  }

  try {
    // Tenta encontrar usuário pelo facebookId
    let user = await userService.encontrarUsuarioPorFacebookId(facebookId);

    // Se não achar, tenta pelo email (caso usuário tenha cadastro tradicional)
    if (!user) {
      user = await userService.encontrarUsuario(email);

      if (user) {
        // Atualiza facebook_id no cadastro existente
        await userService.atualizarFacebookId(user.id, facebookId);
      } else {
        // Se não existir, cria novo usuário
        await userService.criarUsuarioFacebook(name, email, facebookId);
        user = await userService.encontrarUsuarioPorFacebookId(facebookId);
      }
    }

    // Gera JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login com Facebook realizado com sucesso!" });
  } catch (error) {
    console.error("Erro no login com Facebook:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function verificarEmailExistente(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório." });
  }

  try {
    const existingUser = await userService.encontrarUsuario(email);
    if (existingUser) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logout,
  excluirConta,
  loginComGoogle,
  enviarCodigoVerificacao,
  validarCodigoVerificacao,
  loginComFacebook,
  verificarEmailExistente,
};
