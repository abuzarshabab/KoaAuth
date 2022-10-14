const Koa = require('koa')
const Mongodb = require('mongodb')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const render = require('koa-ejs')
const path = require('path')
const joi  = require('joi')


require('dotenv').config()
const { connect, db } = require('./database/db')

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: false
})

// For handling all 
router.get('/', async (context, next) => {
  console.log('Route is attached')
  await context.render('index', { title: "This is going to be first Koa-Auth"})
})

router.get('/register', async (context, next) => {
  const registerFormElements =  ['First_Name', 'Last_Name', 'User_Name', 'Email_ID', 'Mobile_Number',"Password" ]
  const formTitle = 'Before you\'re joining us, Please help us to know you better'

  await context.render('register', { inputElements: registerFormElements, formTitle })
})

router.post('/register', async (context, next) => {
  const registerSchema = joi.object({
    First_Name: joi.string().max(14).min(3).required(),
    Last_Name: joi.string().max(14).min(3),
    User_Name: joi.string().max(30).min(6).required(),
    Email_ID: joi.string().email().required(),
    Mobile_Number: joi.number().required(),
    Password: joi.string().min(8).max(264).required()
  })
  
  console.log(context.request.body)
   
  try{
    const validationResult = await registerSchema.validate(context.request.body) 
    if(validationResult.error) {
      context.throw({code: 400, message: 'Validation error: '+ validationResult.error })
    }
    const isUserExist = await db().collection('user').findOne({ 
      $or: [{ User_Name: validationResult.value.User_Name }, { Email_ID: validationResult.value.Email_ID }]
    })

    console.log('User', isUserExist)
    if(isUserExist) {
      context.throw({code: 403, message: 'Already registered, please login' })
    }

    // ! Encrypting Password before storing
    const insertResult = await db().collection('user').insertOne(validationResult.value)
    console.log(insertResult)

    validationResult.value.Password = null
    validationResult.value._id = insertResult.insertedId
    const responsePayload = validationResult.value
    context.status = 201
    context.body = { message: "You have registered successfully", data: responsePayload }
  } catch(error){
    console.log(error)
    context.status = error.code
    context.body = error.message
  }
})

router.post('/login', (context, next) => {
  console.log(context.url)
  context.body = 'Server is responded with body'
})

router.get('/login', (context, next) => {
  console.log(context.url)
  context.body = 'Server is responded with body'
})



/* Connecting with mongodb */
connect()

/* Starting listening on port */
app.listen(process.env.SERVER_PORT, () => {
  console.log("Server is listening on the localhost:", process.env.SERVER_PORT)
})


/* For handling uncaughtException that is occuerred */
process.on('uncaughtException', (exception) => {
  console.log('uncaughtException ===>>>', exception)
})