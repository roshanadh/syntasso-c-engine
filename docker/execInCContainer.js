const { exec } = require("child_process");

const { writeOutputToFile } = require("../filesystem/index.js");

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
				let stringOutput = stdout.toString();
				let jsonOutput = JSON.parse(stringOutput);

				if (jsonOutput.type === "test-status") {
					// stdout is the test status for an individual test case
					socketInstance.instance.to(socketId).emit("test-status", {
						...jsonOutput,
					});
				} else if (jsonOutput.type === "full-response") {
					// stdout is the final response for user's submission
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `User's submission executed`,
						});
					//  write output to client-files/outputs/${socketId}.txt
					writeOutputToFile(socketId, stringOutput)
						.then(() => resolve(jsonOutput))
						.catch(error => {
							return reject({
								error,
							});
						});
				} else {
					console.error(
						`New response type encountered in execInCContainer for socketId ${socketId}:`,
						jsonResponse
					);
				}
			});
			mainWrapper.stderr.on("data", stderr => {
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
