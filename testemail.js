const { enviarEmailVerificacao } = require('./services/emailService');

async function testarEmail() {
  const emailTeste = 'ronaldhoney132@gmail.com'; // pode ser qualquer email, não precisa ser real
  const codigoTeste = '123456';

  try {
    await enviarEmailVerificacao(emailTeste, codigoTeste);
    console.log('Email enviado com sucesso! Verifique o link de preview no console.');
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
}

testarEmail();
