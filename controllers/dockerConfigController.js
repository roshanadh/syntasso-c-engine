const { generateSubmissionFile } = require("../filesystem/index.js");
const {
	buildCImage,
	createCContainer,
	startCContainer,
	compileInCContainer,
	execInCContainer,
} = require("../docker/index.js");
const { respondWithError } = require("../util/templateResponses.js");
const compilationErrorParser = require("../util/compilationErrorParser.js");

const handleConfigZero = (req, res) => {
	const containerName = req.body.socketId;

	const { socketInstance } = require("../server.js");

	buildCImage(req, socketInstance)
		.then(stdout => {
			console.log("C image built.");
			return createCContainer(req, socketInstance);
		})
		.then(stdout => {
			console.log(`C container ${containerName} created.`);
			return handleConfigOne(req, res);
		})
		.catch(error => {
			return respondWithError(
				res,
				503,
				"Service unavailable due to server conditions"
			);
		});
};
const handleConfigOne = (req, res) => {
	const containerName = req.body.socketId;

	const { socketInstance } = require("../server.js");

	startCContainer(req, socketInstance)
		.then(stdout => {
			console.log(`C container ${containerName} started.`);
			return handleConfigTwo(req, res);
		})
		.catch(error => {
			// caught error may be an error or an stderr rejected by ...
			// ... any of the docker API functions
			// if (error.error) => True, it is an error
			// if (error.stderr) => True, it is an stderr

			// handle error
			if (error.error) {
				let err = error.error;
				if (
					err.message.includes(
						`No such container: ${req.session.socketId}`
					)
				) {
					return respondWithError(
						res,
						403,
						"Re-request using dockerConfig 0 because container has not been created"
					);
				}
			}

			return respondWithError(
				res,
				503,
				"Service unavailable due to server conditions"
			);
		});
};
const handleConfigTwo = (req, res) => {
	const containerName = req.body.socketId;
	const submissionFileName = `${req.body.socketId}.c`;

	const { socketInstance } = require("../server.js");

	compileInCContainer(req, socketInstance)
		.then(stdout => {
			console.log(
				`User's submission ${submissionFileName} compiled inside C container ${containerName}.`
			);
			return execInCContainer(req, socketInstance);
		})
		.then(stdout => {
			console.log(
				`User's submission ${submissionFileName} executed inside C container ${containerName}.\nstdout: ${stdout}`
			);
			res.status(200).json({
				output: JSON.parse(stdout).stdout,
			});
		})
		.catch(error => {
			// caught error may be an error or an stderr rejected by ...
			// ... any of the docker API functions
			// if (error.error) => True, it is an error
			// if (error.stderr) => True, it is an stderr

			// handle stderr
			if (error.stderr) {
				let { stderr } = error;
				// check if compilation error
				if (
					error.errorType &&
					error.errorType === "compilation-error"
				) {
					parsedError = compilationErrorParser(
						stderr,
						req.session.socketId
					);
					// check if compilationErrorParser detected a Linker Error
					if (
						parsedError.newErrorType &&
						parsedError.newErrorType === "linker-error"
					) {
						return res.status(200).json({
							errorType: parsedError.newErrorType,
							error: {
								errorStack: parsedError.errorStack,
							},
						});
					}

					// check if compilationErrorParser had any errors during parsing
					if (parsedError.errorInParser) {
						return respondWithError(
							res,
							503,
							"Service unavailable due to server conditions"
						);
					}
					// if no error occurred during parsing, respond with the parsed error
					return res.status(200).json({
						errorType: error.errorType,
						error: parsedError,
					});
				} else if (
					// check if runtime error
					error.errorType &&
					error.errorType === "runtime-error"
				) {
					return res.status(200).json({
						errorType: error.errorType,
						error: error.stderr,
					});
				}
			}

			// handle error
			if (error.error) {
				let err = error.error;
				if (
					err.message.includes(
						`No such container:path: ${req.session.socketId}:/usr/src`
					)
				) {
					return respondWithError(
						res,
						403,
						"Re-request using dockerConfig 0 or 1 because container has not been created or started"
					);
				}
			}

			return respondWithError(
				res,
				503,
				"Service unavailable due to server conditions"
			);
		});
};

module.exports = (req, res) => {
	generateSubmissionFile(req)
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
			console.error(`error in dockerConfigController:`, error);
			res.status(503).json({
				error: "Service currently unavailable due to server conditions",
			});
		});
};
