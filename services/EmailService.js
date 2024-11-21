var nodemailer = require('nodemailer');
var { BRAND_NAME, EMAIL, EMAIL_PASS } = require('../config');

const sendEmail = async({ from, to, subject, text, html }) => {
    let transporter = nodemailer.createTransport({
        service: 'SendinBlue',
        auth: {
            user: EMAIL, // generated ethereal user
            pass: EMAIL_PASS, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `${BRAND_NAME} <${from}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
    });
}

module.exports = sendEmail;