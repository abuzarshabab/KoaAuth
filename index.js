const Koa = require('koa')
const Router = require('koa-router')
const Mongodb = require('mongodb')

const app = new Koa()

app.use(async (context) => {
  console.log('Request is arrived')
})

process.on('uncaughtException', (exception) => {
  console.log('uncaughtException ===>>>', exception)
})