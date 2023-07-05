const { default: axios } = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.getAccessToken = async ({ grant_type, options }) => {
  try {
    const res = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        grant_type,
        redirect_uri: "http://localhost:5000/auth/google",
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        client_id: process.env.GOOGLE_CLIENT_ID,
        ...options,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (err) {
    throw err;
  }
};

module.exports.getUser = async ({ session }) => {
  try {
    const user = jwt.decode(session?.id_token);

    return user;
  } catch (error) {
    throw error;
  }
};
