const nodemailer = require("nodemailer");
require("dotenv").config();
const { google } = require("googleapis");


const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_CLIENT_EMAIL = process.env.GMAIL_CLIENT_EMAIL;

let accessToken;


async function generateAccessToken () {
  try {
    const oAuth2Client = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI)
    oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN })
    console.log("Generating Token")
    accessToken = await oAuth2Client.getAccessToken()
  } catch (error) {
    console.log(   "Error while generating access token, you might have to change the refresh token ",
      error
    );
  }
  return accessToken;
};

async function getTransporter() {
  try {
    
    if (accessToken === undefined || accessToken.res.data.expiry_date < Date.UTC()) { 
     const token = await generateAccessToken() 
     console.log('\n', 'Generated Token', token)
    }
    
    return transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'oauth2',
        user: GMAIL_CLIENT_EMAIL,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken:  GMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      }
    })
  } catch (error) {
    console.log("Error while preparing Transporter", error)
    return null
  }
}

module.exports = { getTransporter, generateAccessToken}