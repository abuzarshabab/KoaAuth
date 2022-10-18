const nodemailer = require("nodemailer");
require("dotenv").config();
const { google } = require("googleapis");


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;

let accessToken;


async function generateAccessToken () {
  try {
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
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
        user: CLIENT_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken:  REFRESH_TOKEN,
        accessToken: accessToken,
      }
    })
  } catch (error) {
    console.log("Error while preparing Transporter", error)
    return null
  }
}

module.exports = { getTransporter, generateAccessToken}