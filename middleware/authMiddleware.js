const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN'

  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    req.user = user; // dados do payload (ex: id, email)
    next();
  });
}

module.exports = autenticarToken;
