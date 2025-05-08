const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER, // your email
    pass: process.env.MAIL_PASS  // app password
  }
});

const sendMail = ({ to, subject, text }) => {
  return transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text
  });
};

module.exports = sendMail;
