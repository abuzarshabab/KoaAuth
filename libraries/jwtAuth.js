const jwt = require('jsonwebtoken')

async function sendAuthorization (authInfo, context) {
  const token = await jwt.sign({ User_Name: authInfo.User_Name, userId: authInfo._id }, process.env.JWT_SECRET)
  console.log(token)
  console.log("Inside if after true");
    return (context.body = {
    message: "You're logged in 😄",
    token,
  });
}

module.exports = { sendAuthorization }