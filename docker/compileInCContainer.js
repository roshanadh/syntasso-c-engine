const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
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

			console.log(submissionFileName);
			exec(
				`docker exec -i ${containerName} gcc ${submissionFileName} -o submission`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(
							`error while compiling submission inside container ${containerName}: ${error}`
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `error while compiling submission`,
							});

						return reject(error);
					} else if (stderr) {
						console.error(
							`stderr while compiling submission inside container ${containerName}: ${stderr}`
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while compiling submission: ${stderr}`,
							});
						return reject(stderr);
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
			return reject(error);
		}
	});
};
