const router = require("express").Router();

const submitController = require("../controllers/submitController.js");
const dockerConfigController = require("../controllers/dockerConfigController.js");

router.get("/", (req, res) => {
	res.json({ message: "Hello World!" });
});

router.post("/submit", submitController, dockerConfigController);

module.exports = router;
