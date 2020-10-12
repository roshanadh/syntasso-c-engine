const {
	handleConfigZero,
	handleConfigOne,
	handleConfigTwo,
} = require("../handlers/dockerConfigHandlers.js");
const { respondWithError } = require("../util/templateResponses");
const {
	initDirectories,
	generateTestFiles,
} = require("../filesystem/index.js");
const generateSubmissionFile = require("../filesystem/generateSubmissionFile.js");

module.exports = (req, res, next) => {
	initDirectories(req.session.socketId)
		.then(() => generateTestFiles(req))
		.then(() => generateSubmissionFile(req))
		.then(() => {
			const dockerConfig = parseInt(req.body.dockerConfig);
			switch (dockerConfig) {
				case 0:
					handleConfigZero(req, res);
					break;
				case 1:
					handleConfigOne(req, res);
					break;
				case 2:
					handleConfigTwo(req, res);
					break;
			}
		})
		.catch(error => {
			console.error(`error in submitController:`, error);
			respondWithError(
				res,
				503,
				"Service unavailable due to server conditions"
			);
		});
};
