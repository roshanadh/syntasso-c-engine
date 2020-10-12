const router = require("express").Router();

const paramValidator = require("../middlewares/paramValidator.js");
const submitController = require("../controllers/submitController.js");

router.get("/", (req, res) => {
	res.json({ message: "Hello World!" });
});

router.post("/submit", paramValidator, submitController);

module.exports = router;
