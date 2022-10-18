const registerRoutes = require('koa-router')()
const { getConnection } = require('../../database/db')
const joi = require('joi')

registerRoutes.get('/register', async (context, next) => {
  const registerFormElements =  ['First_Name', 'Last_Name', 'User_Name', 'Email_ID', 'Mobile_Number',"Password" ]
  const formTitle = 'Before you\'re joining us, Please help us to know you better'
  await context.render('register', { inputElements: registerFormElements, formTitle })
})

registerRoutes.post('/register', async (context, next) => {
  const registerSchema = joi.object({
    First_Name: joi.string().max(14).min(3).required(),
    Last_Name: joi.string().max(14).min(3),
    User_Name: joi.string().lowercase().max(30).min(6).required(),
    Email_ID: joi.string().email().lowercase().required(),
    Mobile_Number: joi.number().required(),
    Password: joi.string().min(8).max(264).required()
  })

    const validationResult = await registerSchema.validate(context.request.body) 

    if(validationResult.error) {
      console.log('Inside error block')
      context.throw({ code: 400, message: 'Validation error: '+ validationResult.error })
    }

    const isUserExist = await getConnection().collection('user').findOne({ 
      $or: [{ User_Name: validationResult.value.User_Name }, { Email_ID: validationResult.value.Email_ID }]
    })

    console.log('User', isUserExist)
    if(isUserExist) {
      context.throw({code: 403, message: 'Already registered, please login' })
    }

    // ! Encrypting Password before storing
    const insertResult = await getConnection().collection('user').insertOne(validationResult.value)
    console.log(insertResult)

    validationResult.value.Password = undefined
    validationResult.value._id = insertResult.insertedId
    validationResult.value
    context.status = 201
    context.body = { message: "You have registered successfully", data: validationResult.value }
})

module.exports = { registerRoutes }