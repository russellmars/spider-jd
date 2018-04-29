const mail = require('./util/mail')
const getTemplateHTML = mail.getTemplateHTML
const ejs = require('ejs')
;(async () => {
  mail.sendmail({
    to: 'russellmars@sina.com',
    subject: 'email 测试',
    html: ejs.render(await getTemplateHTML('subscribe'), {
      imgUrl: 'https://russellmars.github.io/image/picture/avatar.jpg',
      name: 'iphone x',
      link: 'http://baidu.com',
      price: '8844.234'
    })
  })
})()
