const nodemailer = require('nodemailer')
const config = require('../mail.config.json')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')


const transporter = nodemailer.createTransport({
  service: config.service,
  auth: config.auth
})

const getTemplateHTML = async function (templateName) {
  return await new Promise((resolve, reject) => {
    const path = require('path')
    fs.readFile(path.join(__dirname, `../mailTemplates/${templateName}.ejs`), 'utf8', function (err, data) {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

exports.sendmail = async function(data, mailOptions) {
  return await new Promise(async (resolve, reject) => {
    transporter.sendMail(Object.assign({}, {
      from: `"${config.name || config.auth.user}" <${config.auth.user}>`,
      html: ejs.render(await getTemplateHTML(data.templateName), {
        imgUrl: data.imgUrl,
        name: data.name,
        link: data.link,
        price: data.price
      })
    }, mailOptions), (error, info) => {
      if (error) {
        return reject(error)
      }
      return resolve(info.messageId)
    })
  })
}

