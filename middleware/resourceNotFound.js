async function  resourceNotFound(context, next) {
  context.status = 404 
  context.body = { message: 'No resource found please check your URL'}
}

module.exports = { resourceNotFound } 