const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'lawson.nimi@gmail.com',
        subject: "Thanks for joining in",
        text: `Welcome to the app, ${name}. Let me know how you get along`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'lawson.nimi@gmail.com',
        subject: "Goodbye from us",
        text: `Don't go ${name}`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}