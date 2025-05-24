const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const { enviarEmailVerificacao } = require('../services/emailService');
const codigoService = require('../services/codigoService');

async function registerUser(req, res) {
  // seu código de registro aqui
}

async function loginUser(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Por favor, informe email e senha.' });
  }

  try {
    const user = await userService.encontrarUsuario(email);

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    console.log('JWT_SECRET:', process.env.JWT_SECRET);  // <-- Aqui

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, message: 'Login realizado com sucesso!' });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

async function logout (req, res) {
  res.json({message: 'Logout realizado com sucesso!'});
}

async function excluirConta (req, res) {
  try {
    const { id } = req.user; // Pega o ID do usuário do token
    const usuario = await userService.encontrarUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    await userService.excluirUsuario(id);
    res.json({ message: 'Conta excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logout,
  excluirConta
};
