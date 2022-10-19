const Koa = require('koa')
const indexPageRouter = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const render = require('koa-ejs')
const jwt = require('koa-jwt')
const path = require('path')
require('dotenv').config()

const { errorHandler } = require('./middleware/errorHandler')
const { loginRoutes } = require('./routes/login')
const { mongodbCreateConnection } = require('./database/db')
const { registerRoutes } = require('./routes/register')
const { resourceNotFound } = require('./middleware/resourceNotFound')

mongodbCreateConnection()

const app = new Koa()

/* Attaching global try catch  */
app.use(errorHandler)
app.use(bodyParser())

app.use(indexPageRouter.allowedMethods())
app.use(loginRoutes.routes())
app.use(registerRoutes.routes())

// * Apart from above all below lines will be protected * //
app.use(jwt({ secret: process.env.JWT_SECRET }))
app.use(indexPageRouter.routes())


indexPageRouter.get('/hello', (context) => {
  console.log('The server is ready  ')
  console.log(context.state)
  context.body = { message : "You are authorized to access this "}
})


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

/* Starting listening on port */
app.listen(process.env.SERVER_PORT, () => {
  console.log("Server is listening on the http://localhost:" + process.env.SERVER_PORT)
})


/* For handling uncaughtException that is occurred */
process.on('uncaughtException', (exception) => {
  console.log('uncaughtException ===>>>', exception)
})