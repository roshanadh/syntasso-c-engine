const {
	socketValidator,
	codeValidator,
	dockerConfigValidator,
} = require("../middlewares/paramValidator.js");
const { respondWithError } = require("../util/templateResponses");
const { initDirectories } = require("../filesystem/index.js");

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
			break;
	}
	initDirectories(req.session.socketId)
		.then(() => next())
		.catch(error => {
			respondWithError(
				res,
				503,
				"Service unavailable due to server conditions"
			);
		});
};
