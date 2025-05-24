const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const autenticarToken = require('../middleware/authMiddleware'); // importe o middleware

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Rotas protegidas por token
router.post('/login/google', authController.loginComGoogle);

router.post('/logout', autenticarToken, authController.logout);

router.post('/enviar-codigo', authController.enviarCodigoVerificacao);
router.post('/validar-codigo', authController.validarCodigoVerificacao);
router.delete('/excluir-conta', autenticarToken, authController.excluirConta);

module.exports = router;
