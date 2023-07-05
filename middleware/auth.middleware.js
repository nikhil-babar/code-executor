const {
  getAccessToken: getGithubAccessToken,
  getUser: getGithubUser,
} = require("../utils/getGithubAuth");
const {
  getAccessToken: getGoogleAccessToken,
  getUser: getGoogleUser,
} = require("../utils/getGoogleAuth");
const User = require("../models/User");
require("dotenv").config();

function validateToken({ token_expiry }) {
  const tokenExpiry = new Date(token_expiry);
  const currTime = new Date();

  if (tokenExpiry > currTime) {
    return true;
  } else {
    return false;
  }
}

module.exports.githubAuth = async (req, res, next, { grant_type }) => {
  try {
    let user = null;
    let token = null;

    if (grant_type === "code") {
      const code = req.query.code;

      token = await getGithubAccessToken({
        grant_type: "code",
        options: { code },
      });
      user = await getGithubUser({ accessToken: token.access_token });
    } else {
      if (!req.session.github) {
        return res.sendStatus(403);
      }

      const { access_token_expiry, refresh_token, refresh_token_expiry } =
        req.session.github.token;

      if (validateToken({ token_expiry: access_token_expiry })) {
        return next();
      }

      if (!validateToken({ token_expiry: refresh_token_expiry })) {
        return res.sendStatus(403);
      }

      token = await getGithubAccessToken({
        grant_type: "refresh_token",
        options: { refresh_token },
      });
      user = await getGithubUser({ accessToken: token.access_token });
    }

    await User.findOneAndUpdate(
      {
        github_username: user.login,
      },
      {
        name: user.name,
        email: user.email,
        github_username: user.login,
        avatar: user.avatar_url,
      },
      { upsert: true, new: true }
    );

    const currTime = Date.now();

    req.session.github = {
      token: {
        auth_type: "github",
        access_token: token.access_token,
        access_token_expiry: new Date(
          currTime + token.expires_in * 1000
        ).toISOString(),
        refresh_token: token.refresh_token,
        refresh_token_expiry: new Date(
          currTime + token.refresh_token_expires_in * 1000
        ).toISOString(),
      },
    };

    next();
  } catch (error) {
    console.log(error.message);

    res.sendStatus(500);
  }
};

module.exports.googleAuth = async (req, res, next, { grant_type }) => {
  try {
    let user = null;
    let token = null;

    if (grant_type === "code") {
      const code = req.query.code;

      token = await getGoogleAccessToken({
        grant_type: "authorization_code",
        options: { code },
      });
      user = await getGoogleUser({ session: token });
    } else {
      if (!req.session.google) {
        return res.sendStatus(403);
      }

      const { access_token_expiry, refresh_token } = req.session.google.token;

      if (validateToken({ token_expiry: access_token_expiry })) {
        return next();
      }

      token = await getGoogleAccessToken({
        grant_type: "refresh_token",
        options: { refresh_token },
      });
      user = await getGoogleUser({ session: token });
    }

    await User.findOneAndUpdate(
      {
        email: user.email,
      },
      {
        name: user.name,
        email: user.email,
        avatar: user.picture,
      },
      { upsert: true, new: true }
    );

    const currTime = Date.now();

    req.session.google = {
      token: {
        auth_type: "google",
        access_token: token.access_token,
        access_token_expiry: new Date(
          currTime + token.expires_in * 1000
        ).toISOString(),
        refresh_token: token.refresh_token,
      },
    };

    next();
  } catch (error) {
    console.log(error.message);

    res.sendStatus(500);
  }
};
