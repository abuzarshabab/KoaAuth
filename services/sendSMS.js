// var unirest = require("unirest");

// async function sendSMS({variables_values, numbers, message}){
//   let req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

//   req.headers({
//     "authorization": process.env.FAST2SMS_API_KEY
//   });

//   req.form({
//     "message": message,
//     "language": "english",
//     "route": "q",
//     "numbers": numbers
//   });

//   req.end(function (res) {
//     if (res.error) throw new Error(res.error);
//     console.log(res.body);
//   });

// }
const axios = require("axios").default;
async function sendSMS({ variables_values, numbers, message }) {

    const data = {
      message: message,
      language: "english",
      route: "q",
      numbers: numbers,
    }

  axios.post("https://www.fast2sms.com/dev/bulkV2", data, {
    headers: {
      authorization: process.env.FAST2SMS_API_KEY
    }
  })
}
module.exports = { sendSMS };
