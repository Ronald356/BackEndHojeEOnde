const nodemailer = require('nodemailer');

async function criarTransporter() {
  // Criar conta de teste no Ethereal
  let testAccount = await nodemailer.createTestAccount();

  // Configurar transporter com os dados do Ethereal
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user, // usuário gerado
      pass: testAccount.pass  // senha gerada
    }
  });

  return transporter;
}

async function enviarEmailVerificacao(destinatario, codigo) {
  const transporter = await criarTransporter();

  const info = await transporter.sendMail({
    from: '"Hoje é Onde" <no-reply@hojeeonde.com>', // remetente
    to: destinatario, // destinatário
    subject: "Confirmação de cadastro",
    text: `Seu código de verificação é: ${codigo}`,
    html: `<p>Seu código de verificação é: <b>${codigo}</b></p>`
  });

  console.log("Mensagem enviada: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = {
  enviarEmailVerificacao,
};
