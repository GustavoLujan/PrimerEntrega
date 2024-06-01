const nodemailer = require('nodemailer')
const config = require('../config/config')

const transport=nodemailer.createTransport(
    {
        service: `${config.nodemailerService}`,
        port: 587,
        auth: {
            user: `${config.nodemailerUser}`,
            pass: `${config.nodemailerPass}`
        }
    }
)


const enviarEmail=(to, subject, message)=>{
    return transport.sendMail(
        {
            to, subject, 
            html: message
        }
    )    
}

module.exports = { enviarEmail };