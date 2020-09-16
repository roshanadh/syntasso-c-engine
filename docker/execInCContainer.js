const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		/*
		 * @resolve
		 * Always resolve the stdout as resolve(stdout)
		 *
		 * @reject
		 * Reject the error and stderr values as keys in a JSON object ...
		 * ... that is, as reject({ error }) and reject({ stderr })
		 * This is because when catching rejections with .catch(error) in ...
		 * ... dockerConfigController's functions, we can see if the caught error ...
		 * ... is an error or an stderr with if (error.error) and if (error.stderr)
		 */
		try {
			const { socketId } = req.body;
			const containerName = socketId;

			console.log(
				`Executing user's submission in container ${containerName}`
			);
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: `Executing user's submission...`,
			});

			const mainWrapper = exec(
				`docker exec -ie socketId='${socketId}' ${containerName} node main-wrapper.js`
			);
			mainWrapper.stdout.on("data", stdout => {
				console.log(
					`stdout while executing submission inside container ${containerName}: ${stdout}`
				);
				try {
					let stringOutput = stdout.toString();
					let jsonOutput = JSON.parse(stringOutput);

					if (jsonOutput.type === "test-status") {
						// stdout is the test status for an individual test case
						socketInstance.instance
							.to(socketId)
							.emit("test-status", {
								...jsonOutput,
							});
					} else if (jsonOutput.type === "full-response") {
						// stdout is the final response for user's submission
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `User's submission executed`,
							});
						return resolve(jsonOutput);
					} else {
						console.error(
							`New response type encountered in execInCContainer for socketId ${socketId}:`,
							jsonResponse
						);
					}
				} catch (error) {
					if (error.message.includes("Unexpected token { in JSON")) {
						// this error happens because mainWrapper.stdout ...
						// ... outputs a stream of JSON objects like:
						// ... {}{}{}...
						// we need to create an array of JSON objects: ...
						// ... [{}, {}, {}, ...] in such a case
						try {
							console.log(
								`Parsing stdout with adjoining JSON objects encountered for socketId ${socketId}`
							);
							let stream = stdout.toString().trim();
							stream = stream.split("}{");
							stream.forEach((element, index) => {
								// add missing braces as .split("}{") removes ...
								// ... every instance of "}{" in the stdout
								if (index === 0) stream[index] = element + "}";
								else if (index === stream.length - 1)
									stream[index] = "{" + element;
								else stream[index] = "{" + element + "}";
								// parse JSON and create an array of JSON objects
								stream[index] = JSON.parse(stream[index]);
								// if stream[index] is a test-status type JSON, emit:
								if (
									stream[index].type &&
									stream[index].type === "test-status"
								) {
									socketInstance.instance
										.to(session.socketId)
										.emit("test-status", {
											...stream[index],
										});
								} else {
									// stream[index].type === "full-response"
									socketInstance.instance
										.to(socketId)
										.emit("docker-app-stdout", {
											stdout: `User's submission executed`,
										});
								}
							});
						} catch (err) {
							console.error(
								`Error while parsing stdout with adjoining JSON objects in execInCContainer for socketId ${socketId}:`,
								err
							);
							return reject({
								err,
							});
						}
					} else {
						console.error(
							`Error in execInCContainer for socketId ${socketId}:`,
							error
						);
						return reject({
							error,
						});
					}
				}
			});
			mainWrapper.stderr.on("data", stderr => {
				console.dir({
					stderr: stderr,
				});
				stderr = JSON.parse(stderr.toString());
				console.error(
					`stderr while executing submission inside container ${containerName}:`,
					stderr.stderr
				);
				socketInstance.instance.to(socketId).emit("docker-app-stdout", {
					stdout: `stderr while executing submission: ${stderr.stderr}`,
				});
				return reject({
					stderr: stderr.stderr,
					errorType: "runtime-error",
				});
			});
		} catch (error) {
			console.error(
				`error while executing submission inside container ${containerName}:`,
				error
			);
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: `error while executing submission`,
			});
			return reject({ error });
		}
	});
};
