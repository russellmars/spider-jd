const Koa = require('koa')
const path = require('path')
const router = require('./routes')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

const app = new Koa()

const serve = require('koa-static')

app.use(serve(path.join(__dirname, '/public')))
app.use(router.routes()).use(router.allowedMethods())

app.listen(port, host)
console.log('Server listening on http://' + host + ':' + port)
