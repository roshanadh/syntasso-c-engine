const { generateSubmissionFile } = require("../filesystem/index.js");
const {
	buildCImage,
	createCContainer,
	startCContainer,
	compileInCContainer,
	execInCContainer,
} = require("../docker/index.js");

const containerName = "cont_c";
const submissionFileName = "hello-world.c";

const handleConfigZero = (req, res) => {
	buildCImage()
		.then(stdout => {
			console.log("C image built.");
			createCContainer(containerName)
				.then(stdout => {
					console.log(`C container ${containerName} created.`);
					startCContainer(containerName)
						.then(stdout => {
							console.log(
								`C container ${containerName} started.`
							);
							compileInCContainer(
								containerName,
								submissionFileName
							)
								.then(stdout => {
									console.log(
										`User's submission ${submissionFileName} compiled inside C container ${containerName}.`
									);
									execInCContainer(containerName)
										.then(stdout => {
											console.log(
												`User's submission ${submissionFileName} executed inside C container ${containerName}.\nstdout: ${stdout}`
											);
											res.status(200).json({
												output: stdout,
											});
										})
										.catch(error => {
											res.status(503).json({
												error:
													"Service currently unavailable due to server conditions",
											});
										});
								})
								.catch(error => {
									res.status(503).json({
										error:
											"Service currently unavailable due to server conditions",
									});
								});
						})
						.catch(error => {
							res.status(503).json({
								error:
									"Service currently unavailable due to server conditions",
							});
						});
				})
				.catch(error => {
					res.status(503).json({
						error:
							"Service currently unavailable due to server conditions",
					});
				});
		})
		.catch(error => {
			res.status(503).json({
				error: "Service currently unavailable due to server conditions",
			});
		});
};
const handleConfigOne = (req, res) => {
	startCContainer(containerName)
		.then(stdout => {
			console.log(`C container ${containerName} started.`);
			compileInCContainer(containerName, submissionFileName)
				.then(stdout => {
					console.log(
						`User's submission ${submissionFileName} compiled inside C container ${containerName}.`
					);
					execInCContainer(containerName)
						.then(stdout => {
							console.log(
								`User's submission ${submissionFileName} executed inside C container ${containerName}.\nstdout: ${stdout}`
							);
							res.status(200).json({
								output: stdout,
							});
						})
						.catch(error => {
							res.status(503).json({
								error:
									"Service currently unavailable due to server conditions",
							});
						});
				})
				.catch(error => {
					res.status(503).json({
						error:
							"Service currently unavailable due to server conditions",
					});
				});
		})
		.catch(error => {
			res.status(503).json({
				error: "Service currently unavailable due to server conditions",
			});
		});
};
const handleConfigTwo = (req, res) => {
	compileInCContainer(containerName, submissionFileName)
		.then(stdout => {
			console.log(
				`User's submission ${submissionFileName} compiled inside C container ${containerName}.`
			);
			execInCContainer(containerName)
				.then(stdout => {
					console.log(
						`User's submission ${submissionFileName} executed inside C container ${containerName}.\nstdout: ${stdout}`
					);
					res.status(200).json({
						output: stdout,
					});
				})
				.catch(error => {
					res.status(503).json({
						error:
							"Service currently unavailable due to server conditions",
					});
				});
		})
		.catch(error => {
			res.status(503).json({
				error: "Service currently unavailable due to server conditions",
			});
		});
};

module.exports = (req, res) => {
	generateSubmissionFile("hello-world.c", req.body.code)
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
