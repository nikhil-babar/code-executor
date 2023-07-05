require("dotenv").config();

const { default: axios } = require("axios");

module.exports.getAccessToken = async function generateGithubAccessToken({
  grant_type,
  options,
}) {
  try {
    const url = new URL("https://github.com/login/oauth/access_token");
    const query = new URLSearchParams({
      grant_type,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: "http://localhost:5000/auth/github",
      ...options,
    });

    url.search = query.toString();

    const res = await axios.post(url.href, null, {
      headers: {
        Accept: "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.log(error.message);

    return null;
  }
};

module.exports.getUser = async function getUserWithAccessToken({
  accessToken,
}) {
  try {
    const res = await axios.get("https://api.github.com/user", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data;
  } catch (error) {
    console.log(error.message);

    return null;
  }
};
