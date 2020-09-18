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
const compilationWarningParser = require("../util/compilationWarningParser");

let imageBuildTime = null,
	containerCreateTime = null,
	containerStartTime = null;

const handleConfigZero = (req, res) => {
	const containerName = req.body.socketId;

	const { socketInstance } = require("../server.js");

	buildCImage(req, socketInstance)
		.then(buildLogs => {
			console.log("C image built.");
			imageBuildTime = buildLogs.imageBuildTime;
			return createCContainer(req, socketInstance);
		})
		.then(creationLogs => {
			console.log(`C container ${containerName} created.`);
			containerCreateTime = creationLogs.containerCreateTime;
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
		.then(startLogs => {
			console.log(`C container ${containerName} started.`);
			containerStartTime = startLogs.containerStartTime;
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
	let compilationWarnings = null;

	const { socketInstance } = require("../server.js");

	compileInCContainer(req, socketInstance)
		.then(stdout => {
			console.log(
				`User's submission ${submissionFileName} compiled inside C container ${containerName}.`
			);
			// check if resolved stdout has any warning in it
			if (stdout.warning) {
				compilationWarnings = compilationWarningParser(
					stdout.warning,
					containerName
				);
			}
			return execInCContainer(req, socketInstance);
		})
		.then(stdout => {
			console.log(
				`User's submission ${submissionFileName} executed inside C container ${containerName}.\n`
			);
			let response = {};
			switch (parseInt(req.body.dockerConfig)) {
				case 0:
					response = {
						compilationWarnings,
						...stdout,
						imageBuildTime,
						containerCreateTime,
						containerStartTime,
					};
					break;
				case 1:
					response = {
						compilationWarnings,
						...stdout,
						containerStartTime,
					};
					break;
				case 2:
					response = {
						compilationWarnings,
						...stdout,
					};
					break;
			}
			res.status(200).json(response);
			return console.log("Response sent to the client:", response);
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
				// here, compilation-error doesn't necessarily mean "compilation error", ...
				// ... it just means that the error was encountered inside compileInCContainer ...
				// ... and it may be a compilation-error, or a linker-error, to be determined ...
				// ... by compilationErrorParser
				if (
					error.errorType &&
					error.errorType === "compilation-error"
				) {
					// stderr was obtained during compilation
					parsedError = compilationErrorParser(
						stderr,
						req.session.socketId
					);
					// check if compilationErrorParser had any errors during parsing
					if (parsedError.errorInParser) {
						return respondWithError(
							res,
							503,
							"Service unavailable due to server conditions"
						);
					}
					// if no error occurred during parsing, respond with the parsed error
					switch (parseInt(req.body.dockerConfig)) {
						case 0:
							response = {
								compilationWarnings,
								error: {
									...parsedError,
								},
								imageBuildTime,
								containerCreateTime,
								containerStartTime,
							};
							break;
						case 1:
							response = {
								compilationWarnings,
								error: {
									...parsedError,
								},
								containerStartTime,
							};
							break;
						case 2:
							response = {
								compilationWarnings,
								error: {
									...parsedError,
								},
							};
							break;
					}
					res.status(200).json(response);
					return console.log(
						"Response sent to the client:",
						response
					);
				} else if (
					// check if runtime error
					error.errorType &&
					error.errorType === "runtime-error"
				) {
					// stderr was obtained during runtime
					switch (parseInt(req.body.dockerConfig)) {
						case 0:
							response = {
								compilationWarnings,
								error: {
									errorType: error.errorType,
									errorStack: error.stderr,
								},
								imageBuildTime,
								containerCreateTime,
								containerStartTime,
							};
							break;
						case 1:
							response = {
								compilationWarnings,
								error: {
									errorType: error.errorType,
									errorStack: error.stderr,
								},
								containerStartTime,
							};
							break;
						case 2:
							response = {
								compilationWarnings,
								error: {
									errorType: error.errorType,
									errorStack: error.stderr,
								},
							};
							break;
					}
					res.status(200).json(response);
					return console.log(
						"Response sent to the client:",
						response
					);
				}
			}

			// handle error that is not stderr
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
			return console.log("Response sent to the client:", {
				error: "Service currently unavailable due to server conditions",
			});
		});
};
