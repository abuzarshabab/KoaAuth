
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS({ mobileNumber, message }) {
  const responseBody = await client.messages.create({
    body: message,
    from: process.env.TWILIO_MOBILE_NUMBER,
    to: mobileNumber
  })

  console.log(responseBody)
 
}

module.exports = { sendSMS };
