const {
	codeValidator,
	dockerConfigValidator,
} = require("../middlewares/paramValidator.js");

module.exports = (req, res, next) => {
	if (!codeValidator(req))
		return res.status(400).json({
			error: "No code provided",
		});
	switch (dockerConfigValidator(req)) {
		case "no-config":
			return res.status(400).json({
				error: "No dockerConfig provided",
			});
		case "NaN":
			return res.status(400).json({
				error: "dockerConfig should be a number; got NaN",
			});
		case "no-valid-config":
			return res.status(400).json({
				error: "dockerConfig should be one of [0, 1, 2]",
			});
		default:
			next();
	}
};
