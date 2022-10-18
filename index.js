const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const render = require('koa-ejs')
const path = require('path')
require('dotenv').config()

const { errorHandler } = require('./middleware/errorHandler')
const { loginRoutes } = require('./routes/login')
const { mongodbCreateConnection } = require('./database/db')
const { registerRoutes } = require('./routes/register')
const { resourceNotFound } = require('./middleware/resourceNotFound')

const app = new Koa()

/* Attaching global try catch  */
app.use(errorHandler)
app.use(bodyParser())

app.use(router.routes())
app.use(loginRoutes.routes())
app.use(registerRoutes.routes())
app.use(router.allowedMethods())


render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: false
})


/* Attaching handler for handling un-registered routes */
app.use(resourceNotFound)

/* Connecting with MongoDB */
mongodbCreateConnection()

/* Starting listening on port */
app.listen(process.env.SERVER_PORT, () => {
  console.log("Server is listening on the http://localhost:" + process.env.SERVER_PORT)
})


/* For handling uncaughtException that is occuerred */
process.on('uncaughtException', (exception) => {
  console.log('uncaughtException ===>>>', exception)
})