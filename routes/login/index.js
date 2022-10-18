const loginRoutes = require("koa-router")();
const moment = require("moment/moment");
const joi = require("joi");
const { getConnection } = require("../../database/db");
const { sendEmail } = require("../../services/sendMail");
const { generateOTP } = require("../../libraries/randomCodeGen");

const userCollectionName = "user";
const verificationCodeCollectionName = "verificationCode";

loginRoutes.post("/login", async (context, next) => {
  const registerSchema = joi.object({
    User_Name: joi.string().lowercase().max(30).min(6).optional(),
    Email_ID: joi.string().lowercase().email().optional(),
    Mobile_Number: joi.number().optional(),
    Password: joi.string().min(8).max(264).optional(),
    Login_With: joi
      .string()
      .allow("Password", "Email_ID", "Mobile_Number", "Email_OTP"),
  });

  const validationResult = registerSchema.validate(context.request.body);
  console.log(context.request.body);
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
        { User_Name: validationResult.value.User_Name },
        { Email_ID: validationResult.value.Email_ID },
        { Mobile_Number: validationResult.value.Mobile_Number },
      ],
    });

  console.log(userInstance);

  
  if (!userInstance) {
    context.status = 401;
    return (context.body = { message: "Username or password does not match" });
  }

  switch (context.request.body.Login_With) {
    case "User_Name":
    case "Password":
      if (
        userInstance.User_Name === context.request.body.User_Name &&
        userInstance.Password === context.request.body.Password
      ) {
        console.log("Inside if after true");
        return (context.body = {
          message: "You're logged in 😄",
          token: "Random string, from JWT for Authorization",
        });
      }
      context.status = 401;
      context.body = {
        message:
          "Username or Password does not match, Please check your password",
      };
      break;

    case "Email_ID":
      const verificationCode = generateOTP();
      const verificationDetails = {
        Email_ID: userInstance.Email_ID,
        ExpiresAt: moment()
          .add(process.env.OTP_EXPIRATION_DURATION, "minutes")
          .valueOf(),
        attemptsRemaining: +process.env.MAX_ALLOWED_ATTEMPTS,
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

    // case "Mobile_Number":
    //   const verificationCodeSMS = generateOTP();

    //   const verificationDetailsSMS = {
    //     Mobile_Number: userInstance.Mobile_Number,
    //     ExpiresAt: moment()
    //       .add(process.env.OTP_EXPIRATION_DURATION, "minutes")
    //       .valueOf(),
    //     attemptsRemaining: +process.env.MAX_ALLOWED_ATTEMPTS,
    //     verificationCode: verificationCodeSMS,
    //     verified: false
    //   };
    
    //   const SMSOptions = { numbers: [userInstance.Mobile_Number], message: 'Hello this is first fast2SMS your' , variables_values: verificationCodeSMS}

    //   await getConnection()
    //     .collection(verificationCodeCollectionName)
    //     .insertOne(verificationDetailsSMS);

    //   const sendMessageRes = await sendSMS(SMSOptions);
    //   console.log(sendMessageRes)
    //   context.status = 201;
    //   context.body = { message: "Verification code sent to your mobile number" };
    //   break;

    default:
      context.status = 500;
      context.body = { message: "Something went wrong" };
      break;
  }
});

loginRoutes.post("/login/verifyOTP", async (context, next) => {

  const searchCondition = {
    ExpiresAt: { $gte: moment.now() },
    verified: false,
  };

  if (context.request.body.Email_ID) {
    searchCondition.Email_ID = context.request.body.Email_ID;
  }
  if (context.request.body.Mobile_Number) {
    searchCondition.Mobile_Number = context.request.body.Mobile_Number;
  }

  const [otpDetails] = await getConnection()
    .collection(verificationCodeCollectionName)
    .find(searchCondition).sort({ ExpiresAt : -1}).limit(1).toArray();

    console.log(otpDetails)
  if (!otpDetails) {
    context.status = 401;
    return (context.body = {
      message: "Your verification code is expired or not found",
    });
  }

  /* Verify OTP */
  if (otpDetails.verificationCode === context.request.body.OTP) {
    await getConnection()
      .collection(verificationCodeCollectionName)
      .updateMany(searchCondition, { $set: { verified: true } } );

    return (context.body = {
      message: "You're logged in 😄 ",
      token: "Random string, from JWT for Authorization",
    });
  }

  await getConnection()
    .collection(verificationCodeCollectionName)
    .updateMany(searchCondition, { $inc: { attemptsRemaining: -1 } });

  context.status = 401;
  context.body = {
    message:
      "Verification code does not match, Please check your OTP and retry",
  };
});

loginRoutes.get("/login", (context, next) => {
  console.log(context.url);
  context.body = "Server is responded with body";
});

module.exports = { loginRoutes };
