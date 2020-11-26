const nodemailer = require("nodemailer");
var sgTransport = require('nodemailer-sendgrid-transport');
module.exports = async ({ from, to, subject, text, html}) => {

    // var options ={
    //     auth:{
    //         api_key:
    //     }
    // }

    // var mailer =nodemailer.createTransport(sgTransport(options))
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            // service:'gmail',

            // secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER, // generated ethereal user
                pass: process.env.MAIL_PASSWORD, // generated ethereal password
            },
        });
// console.log(transporter)
        // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `inShare <${from}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
    });
    // console.log(info)
}
