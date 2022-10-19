const loginRoutes = require("koa-router")();

const authInfo = { name: process.env.BASIC_AUTH_NAME, pass: process.env.BASIC_AUTH_PASS}

const auth = require('koa-basic-auth')

const { postLogin, postLoginVerifyOTP, getLogin } = require('../../controller/loginController')


loginRoutes.post("/login", auth(authInfo), postLogin );

loginRoutes.post("/login/verifyOTP", postLoginVerifyOTP );

loginRoutes.get("/login", getLogin);

module.exports = { loginRoutes };
