const { exec } = require("child_process");

const copyClientFilesToCContainer = require("./copyClientFilesToCContainer");

const compileSubmission = (req, socketInstance) => {
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
			const submissionFileName = `${socketId}.c`;

			console.log(
				`Compiling user's submission in container ${containerName}...`
			);
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: `Compiling user's submission...`,
			});

			exec(
				`docker exec -i ${containerName} gcc ${submissionFileName} -o submission`,
				(error, stdout, stderr) => {
					// compilation error is received as error as well as an stderr
					if (stderr) {
						console.error(
							`stderr while compiling submission inside container ${containerName}:`,
							stderr
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while compiling submission: ${stderr}`,
							});
						return reject({
							stderr,
							errorType: "compilation-error",
						});
					} else if (error) {
						console.error(
							`error while compiling submission inside container ${containerName}:`,
							error
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `error while compiling submission`,
							});

						return reject({ error });
					}
					if (stdout.trim() !== "") {
						console.log(
							`stdout while compiling submission inside container ${containerName}: ${stdout}`
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stdout while compiling submission: ${stdout}`,
							});
					}
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `User's submission compiled`,
						});
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.log(`error during compileInCContainer: ${error}`);
			return reject({ error });
		}
	});
};

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		copyClientFilesToCContainer(req, socketInstance)
			.then(stdout => {
				return compileSubmission(req, socketInstance);
			})
			.then(stdout => {
				return resolve(stdout);
			})
			.catch(error => {
				// return reject(error) and not reject({ error }) because ...
				// ... at this point, error is already an object
				return reject(error);
			});
	});
};
