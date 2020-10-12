const {
	handleConfigZero,
	handleConfigOne,
	handleConfigTwo,
	handle403Response,
} = require("../handlers/index.js");
const {
	initDirectories,
	generateTestFiles,
} = require("../filesystem/index.js");
const generateSubmissionFile = require("../filesystem/generateSubmissionFile.js");

module.exports = (req, res, next) => {
	initDirectories(req.session.socketId)
		.then(() => generateSubmissionFile(req))
		.then(() => generateTestFiles(req))
		.then(() => {
			const dockerConfig = parseInt(req.body.dockerConfig);
			switch (dockerConfig) {
				case 0:
					// pass empty object as "times" argument, since no times ...
					// ... have been recorded as of yet
					handleConfigZero(req, res, next, {});
					break;
				case 1:
					// pass empty object as "times" argument, since no times ...
					// ... have been recorded as of yet
					handleConfigOne(req, res, next, {});
					break;
				case 2:
					// pass empty object as "times" argument, since no times ...
					// ... have been recorded as of yet
					handleConfigTwo(req, res, next, {});
					break;
			}
		})
		.catch(error => {
			console.error(`error in submitController:`, error);
			/*
			 * error.errorInGenerateTestFiles exists if some error occurred mid-generation of ...
			 * ... test files
			 */
			if (error.errorInGenerateTestFiles) {
				return handle403Response(
					res,
					"Re-request with both sampleInput and expectedOutput in each dictionary of testCases array"
				);
			}
			next(error);
		});
};
