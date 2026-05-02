const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Railyatri System" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    if (options.attachments) {
        mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Real Email sent to: %s under ID: %s', options.email, info.messageId);
};

module.exports = sendEmail;
