const { getTransporter } = require("../libraries/mail");

sendEmail = async ({ emailSubject, recipientEmailId, recipientText, recipientHtml }) => {
  return new Promise(async (resolve, reject) => {
      try {
      const transporter = await getTransporter();
  
      if(!recipientEmailId) {
        console.log('Recipient recipientEmailId is empty')
        return reject({ code: 400, message: "Email_ID Can't be empty"});
      }

      console.log({ emailSubject, recipientEmailId, recipientText, recipientHtml })
        const mailOption = {
          from: "ThinkJS KoaAuth 📧 <abuzarshabab@gmail.com>",
          to: recipientEmailId,
          subject: emailSubject,
          text: recipientText,
          html: recipientHtml
        }
  
        transporter.sendMail(mailOption, function (error, info) {
          if (info) {
            console.log("Message sent1: ", info);
            return resolve({code : 201, message: 'Email Sent' })
          } 
          console.log("Error in promise  >>>> ", error);
          return reject({ code: 500, message: 'Internal server error'})
        })
      } catch (error) {
        console.log("Error while sending using transporter", error);
        return reject({ code: 500, message: 'Internal server error'});
      }
    })
};
module.exports = { sendEmail }