const nodemailer = require('nodemailer');
module.exports.send = (email, subject, html) => {
    const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS
    }
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email: ', error);
        }
        console.log('Email sent: ', info.response);
    });
}

