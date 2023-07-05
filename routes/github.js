const router = require("express").Router();
const { Octokit } = require("@octokit/core");

router.post("/create_repo", async (req, res) => {
  try {
    const { access_token } = req.session.github?.token;
    const { name, description } = req.body;

    if (!name) return res.sendStatus(422);

    const octokit = new Octokit({
      auth: access_token,
    });

    const response = await octokit.request("POST /user/repos", {
      name,
      description: "This is your first repo!",
      homepage: "https://github.com",
      private: false,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;
