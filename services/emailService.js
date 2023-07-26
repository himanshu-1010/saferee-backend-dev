const { createTransport } = require("nodemailer");
const { SES } = require("aws-sdk");

const smtpTransport = createTransport({
  SES: new SES({
    accessKeyId: process?.env?.DEFAULT_SES_ACCESS_KEY_ID,
    secretAccessKey: process?.env?.DEFAULT_SES_SECRET_ACCESS_KEY,
    region: process?.env?.DEFAULT_SES_REGION,
  }),
});

exports.sendMail = ({
  to,
  from = global.config.mailerConstants.from,
  replyTo = global.config.mailerConstants.replyTo,
  subject,
  html,
  cc = null,
  bcc = null,
  attachments = null,
}) => {
  const mailObject = {};
  mailObject.to = to;
  mailObject.from = from;
  mailObject.replyTo = replyTo;
  mailObject.subject = subject;
  mailObject.html = html;
  mailObject.bcc = null;
  if (cc && cc?.length > 0) {
    mailObject.cc = cc;
  }
  if (bcc && bcc?.length > 0) {
    mailObject.bcc = bcc;
  }
  if (attachments && attachments?.length > 0) {
    mailObject.attachments = attachments;
  }
  if (to && to?.length > 0) {
    smtpTransport
      .sendMail(mailObject)
      .then((res) => {
        console.log(`mail object success`, res);
      })
      .catch((err) => {
        console.log(`mail object error`, err);
      });
  }
};
