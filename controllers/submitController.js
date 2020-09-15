const {
	socketValidator,
	codeValidator,
	dockerConfigValidator,
	testCasesValidator,
} = require("../middlewares/paramValidator.js");
const { respondWithError } = require("../util/templateResponses");
const {
	initDirectories,
	generateTestFiles,
} = require("../filesystem/index.js");

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
	switch (testCasesValidator(req)) {
		case "no-test-cases":
			return res.status(400).json({
				error: "No test cases provided",
			});
		case "not-an-array":
			return res.status(400).json({
				error: "testCases should be an array",
			});
		case "cannot-parse":
			return res.status(400).json({
				error:
					"Invalid type of testCases provided; provide an array of JSON object",
			});
		default:
			break;
	}
	initDirectories(req.session.socketId)
		.then(() => generateTestFiles(req))
		.then(() => next())
		.catch(error => {
			respondWithError(
				res,
				503,
				"Service unavailable due to server conditions"
			);
		});
};
