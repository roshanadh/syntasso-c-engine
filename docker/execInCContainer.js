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

			exec(
				`docker exec -i ${containerName} node main-wrapper.js`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(
							`error while executing submission inside container ${containerName}:`,
							error
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `error while executing submission`,
							});
						return reject({ error });
					} else if (stderr) {
						console.error(
							`stderr while executing submission inside container ${containerName}:`,
							stderr
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while executing submission: ${stderr}`,
							});
						return reject({ stderr });
					}
					console.log(
						`stdout while executing submission inside container ${containerName}: ${stdout}`
					);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `User's submission executed`,
						});
					//  write output to client-files/outputs/${socketId}.txt
					writeOutputToFile(socketId, stdout)
						.then(() => resolve(stdout))
						.catch(error => {
							return reject({ error });
						});
				}
			);
		} catch (error) {
			console.log(`error during execInCContainer:`, error);
			return reject({ error });
		}
	});
};
