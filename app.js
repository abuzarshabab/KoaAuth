const Koa = require('koa')
const json = require('koa-json')
const KoaRouter = require('koa-router')
const render = require('koa-ejs')
const path = require('path')


const app = new Koa()
const router = new KoaRouter()

const PORT = 3001

// Json Prettier
app.use(router.routes()).use(router.allowedMethods())

// app.use(async (context, next) => {
//   let count = 0
//   console.log('Initially inside first middleware (Down stream', ++count)
//   await next()
//   console.log('Last time inside the first middleware (UpStream )', ++count)
// })
render(app, {
  root: path.join(__dirname + '/views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: false,
})

router.get('/', async (context) => {
  await context.render('index', { title: "Hello User how are you"})
})

router.get('/test', (context) => { 
  return context.body = 'This is very lightweight framework'
})

// app.use(async (context) => {
//   console.log('In the last middleware and it going to send response')
//   return context.body = { Greet: "Hello Koa world"  }
// })

app.listen(PORT, () => {
  console.log('Server is listening on localhost:', 3001)
})

app.on('error', (error, context) => {
  console.log('Error is occurred :', context)
  return context.body = "Error is occurred, shortly it'll start working"
})