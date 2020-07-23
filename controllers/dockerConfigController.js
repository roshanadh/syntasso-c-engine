const { generateSubmissionFile } = require("../filesystem/index.js");
const {
	buildCImage,
	createCContainer,
	startCContainer,
	compileInCContainer,
	execInCContainer,
} = require("../docker/index.js");
const { respondWith503 } = require("../util/templateResponses.js");

const handleConfigZero = (req, res) => {
	const containerName = req.body.socketId;
	const submissionFileName = `${req.body.socketId}.c`;

	const { socketInstance } = require("../server.js");

	buildCImage(req, socketInstance)
		.then(stdout => {
			console.log("C image built.");
			createCContainer(req, socketInstance)
				.then(stdout => {
					console.log(`C container ${containerName} created.`);
					startCContainer(req, socketInstance)
						.then(stdout => {
							console.log(
								`C container ${containerName} started.`
							);
							compileInCContainer(req, socketInstance)
								.then(stdout => {
									console.log(
										`User's submission ${submissionFileName} compiled inside C container ${containerName}.`
									);
									execInCContainer(req, socketInstance)
										.then(stdout => {
											console.log(
												`User's submission ${submissionFileName} executed inside C container ${containerName}.\nstdout: ${stdout}`
											);
											res.status(200).json({
												output: stdout,
											});
										})
										.catch(error => {
											return respondWith503(res);
										});
								})
								.catch(error => {
									return respondWith503(res);
								});
						})
						.catch(error => {
							return respondWith503(res);
						});
				})
				.catch(error => {
					return respondWith503(res);
				});
		})
		.catch(error => {
			return respondWith503(res);
		});
};
const handleConfigOne = (req, res) => {
	const containerName = req.body.socketId;
	const submissionFileName = `${req.body.socketId}.c`;
	startCContainer(req, socketInstance)
		.then(stdout => {
			console.log(`C container ${containerName} started.`);
			compileInCContainer(req, socketInstance)
				.then(stdout => {
					console.log(
						`User's submission ${submissionFileName} compiled inside C container ${containerName}.`
					);
					execInCContainer(req, socketInstance)
						.then(stdout => {
							console.log(
								`User's submission ${submissionFileName} executed inside C container ${containerName}.\nstdout: ${stdout}`
							);
							res.status(200).json({
								output: stdout,
							});
						})
						.catch(error => {
							return respondWith503(res);
						});
				})
				.catch(error => {
					return respondWith503(res);
				});
		})
		.catch(error => {
			return respondWith503(res);
		});
};
const handleConfigTwo = (req, res) => {
	const containerName = req.body.socketId;
	const submissionFileName = `${req.body.socketId}.c`;
	compileInCContainer(req, socketInstance)
		.then(stdout => {
			console.log(
				`User's submission ${submissionFileName} compiled inside C container ${containerName}.`
			);
			execInCContainer(req, socketInstance)
				.then(stdout => {
					console.log(
						`User's submission ${submissionFileName} executed inside C container ${containerName}.\nstdout: ${stdout}`
					);
					res.status(200).json({
						output: stdout,
					});
				})
				.catch(error => {
					return respondWith503(res);
				});
		})
		.catch(error => {
			return respondWith503(res);
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
		.catch(err => {
			res.status(503).json({
				error: "Service currently unavailable due to server conditions",
			});
		});
};
