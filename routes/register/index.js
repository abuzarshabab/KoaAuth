const registerRoutes = require('koa-router')()


const { getRegister, postRegister} = require('../../controller/registerController')

registerRoutes.get('/register', getRegister)

registerRoutes.post('/register', postRegister)

module.exports = { registerRoutes } 