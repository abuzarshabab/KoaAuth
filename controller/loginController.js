const moment = require("moment/moment");
const joi = require("joi");

const { getConnection } = require("../database/db");
const { sendEmail } = require("../services/sendMail");

const { sendSMS} = require('../services/sendSMS')
const { generateOTP } = require("../libraries/codeGen");
const { sendAuthorization } = require('../libraries/jwtAuth')

const userCollectionName = "user";
const verificationCodeCollectionName = "verificationCode";

async function postLogin (context) {
  const requestBody = context.request.body

  const registerSchema = joi.object({
    User_Name: joi.string().lowercase().max(30).min(6).optional(),
    Email_ID: joi.string().lowercase().email().optional(),
    Mobile_Number: joi.number().optional(),
    Password: joi.string().min(8).max(264).optional(),
    Login_With: joi
      .string()
      .allow("Password", "Email_ID", "Mobile_Number"),
  });

  const validationResult = registerSchema.validate(requestBody);

  if (validationResult.error) {
    context.throw({
      code: 400,
      message: "Validation error: " + validationResult.error,
    });
  }

  const userInstance = await getConnection()
    .collection(userCollectionName)
    .findOne({
      $or: [
        { User_Name: requestBody.User_Name },
        { Email_ID: requestBody.Email_ID },
        { Mobile_Number: requestBody.Mobile_Number },
      ],
    });

  if (!userInstance) {
    context.status = 401;
    return (context.body = { message: "You are not registered with us, Please register" });
  }

  switch (requestBody.Login_With) {
    case "User_Name":
    case "Password":

      /* if User_Name and Password does not match return 401 */
      if (userInstance.User_Name === requestBody.User_Name && userInstance.Password === requestBody.Password) {
        sendAuthorization(userInstance, context)
      }

      context.status = 401;
      context.body = {
        message:
          "Username or Password does not match, Please check your password",
      };

      break;

    /* After validation  */
    case "Email_ID":
      const verificationCode = generateOTP();
      const verificationDetails = {
        Email_ID: userInstance.Email_ID,
        ExpiresAt: moment()
          .add(process.env.OTP_EXPIRATION_DURATION, "minutes")
          .valueOf(),
        attemptsRemaining: +process.env.OTP_MAX_ALLOWED_ATTEMPTS,
        verificationCode: verificationCode,
        verified: false
      };

      const emailPayload = {
        emailSubject: "Login verification code",
        recipientEmailId: userInstance.Email_ID,
        recipientText: `Your verification code is ${verificationCode}\n valid for ${process.env.OTP_EXPIRATION_DURATION} minutes`,
      };

      await getConnection()
        .collection(verificationCodeCollectionName)
        .insertOne(verificationDetails);

      await sendEmail(emailPayload);

      context.status = 201;
      context.body = { message: "Verification code sent to your mail" };
      break;

    case "Mobile_Number":
      const verificationCodeSMS = generateOTP();

      const verificationDetailsSMS = {
        Mobile_Number: userInstance.Mobile_Number,
        ExpiresAt: moment()
          .add(process.env.OTP_EXPIRATION_DURATION, "minutes")
          .valueOf(),
        attemptsRemaining: +process.env.OTP_MAX_ALLOWED_ATTEMPTS,
        verificationCode: verificationCodeSMS,
        verified: false
      };
    

      await getConnection()
        .collection(verificationCodeCollectionName)
        .insertOne(verificationDetailsSMS);

      const sendMessageRes = await sendSMS({ 
        mobileNumber: "+" + userInstance.Mobile_Number,
        message: `ThinkJS-KoaAuth Login OTP is ${verificationCodeSMS} Please don't share to anyone`
      });
      console.log(sendMessageRes)
      context.status = 201;
      context.body = { message: "Verification code sent to your mobile number" };
      break;

    default:
      context.status = 500;
      context.body = { message: "Something went wrong" };
      break;
  }
}

async function postLoginVerifyOTP(context, next) {
  const requestBody = context.request.body
  const searchCondition = {
    ExpiresAt: { $gte: moment.now() },
    verified: false,
  };

  const userInstance = await getConnection()
    .collection(userCollectionName)
    .findOne({
      $or: [
        { User_Name: requestBody.User_Name },
        { Email_ID: requestBody.Email_ID },
        { Mobile_Number: requestBody.Mobile_Number },
      ],
    });

    if (!userInstance) {
      context.status = 401;
      return (context.body = { message: "You are not registered with us, Please register" });
    }
  if (requestBody.Email_ID) {
    searchCondition.Email_ID = requestBody.Email_ID;
  }

  if (requestBody.Mobile_Number) {
    searchCondition.Mobile_Number = requestBody.Mobile_Number;
  }

  const [otpDetails] = await getConnection()
    .collection(verificationCodeCollectionName)
    .find(searchCondition).sort({ ExpiresAt : -1}).limit(1).toArray();

  if (!otpDetails) {
    context.status = 401;
    return (context.body = {
      message: "Your verification code is expired or not found",
    });
  }

  if (otpDetails.verificationCode === requestBody.OTP) {
    /*  Verify OTP succeeded */
    await getConnection().collection(verificationCodeCollectionName).updateMany(searchCondition, { $set: { verified: true } } );
    await sendAuthorization(userInstance, context)
  } else {
    /*  Verify OTP failed */
    await getConnection()
      .collection(verificationCodeCollectionName)
      .updateMany(searchCondition, { $inc: { attemptsRemaining: -1 } });
    context.status = 401;
    context.body = {
      message:
        "Verification code does not match, Please check your OTP and retry",
    };
  }

}

async function getLogin(context, next) {
  console.log(context.url);
  context.body = "Server is responded with body";
}
module.exports = { postLogin, postLoginVerifyOTP, getLogin}