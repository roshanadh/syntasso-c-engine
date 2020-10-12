const router = require("express").Router();

const { paramValidator, errorHandler } = require("../middlewares/index.js");
const submitController = require("../controllers/submitController.js");

router.get("/", (req, res) => {
	res.json({ message: "Hello World!" });
});

router.post("/submit", paramValidator, submitController);

router.use(errorHandler);

module.exports = router;
