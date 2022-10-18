async function  errorHandler(context, next) {
  try {
    await next();
    // catch any error that might have occurred
  } catch (error) {
    console.log('Inside global catch block', error)

    if(error.code && error.message) {
      context.status = error.code
      context.body = { message: error.message }
    } else {
      context.status = 500 
      context.body = { message: 'Internal server error'}
    }
  }
}

module.exports = { errorHandler } 