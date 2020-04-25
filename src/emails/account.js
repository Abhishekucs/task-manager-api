const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const userWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'judopipu.abhishek@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you feel about this app.` 
    })
}

const userCanceledMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'judopipu.abhishek@gmail.com',
        subject: 'Pleasure to have you here',
        text: `Nice having ${name} on our app. Hope to see you again`
    })
}

module.exports = {
    userWelcomeMail,
    userCanceledMail
}