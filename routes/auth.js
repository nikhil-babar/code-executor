const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
require("dotenv").config();

router.get(
  "/google",
  (req, res, next) =>
    authMiddleware.googleAuth(req, res, next, { grant_type: "code" }),
  async (_req, res) => {
    try {
      res.redirect("http://localhost:3000");
    } catch (error) {
      res.sendStatus(500);
    }
  }
);

router.get(
  "/github",
  (req, res, next) =>
    authMiddleware.githubAuth(req, res, next, { grant_type: "code" }),
  async (_req, res) => {
    try {
      res.redirect("http://localhost:3000");
    } catch (error) {
      res.sendStatus(500);
    }
  }
);

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      res.clearCookie("connect.sid");
      return res.sendStatus(200);
    } else {
      return res.sendStatus(404);
    }
  });
});

module.exports = router;
