const {
	socketValidator,
	codeValidator,
	dockerConfigValidator,
} = require("../middlewares/paramValidator.js");

module.exports = (req, res, next) => {
	switch (socketValidator(req)) {
		case "no-socket":
			return res.status(400).json({
				error: "No socket ID provided",
			});
		case "unknown-socket":
			return res.status(401).json({
				error: "Socket ID not recognized",
			});
		default:
			break;
	}
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
