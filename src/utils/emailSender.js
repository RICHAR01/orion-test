import Boom from 'boom';

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
import config from '../../config'
const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: config.email.auth
});

export async function send(options) {
  const templateOriginal = fs.readFileSync(__dirname + '/emails/' + options.template + '.hbs').toString('utf-8');

  const template = handlebars.compile(templateOriginal);

  const html = template(options.params);

  const email = {
    to: options.to,
    from: '"' + config.email.from + '" <' + config.email.auth.user + '>',
    subject: options.subject,
    html: html,
    text: html
  };

  return transporter.sendMail(email);
}
