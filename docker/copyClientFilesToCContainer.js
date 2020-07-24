const { exec } = require("child_process");
const path = require("path");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			const containerName = socketId;

			console.log(`Copying client files to container ${containerName}`);
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: `Copying client files to container...`,
			});

			const localPath = path.resolve(
				__dirname,
				"..",
				"client-files",
				socketId
			);

			exec(
				`docker cp ${localPath}/. ${containerName}:/usr/src/sandbox/`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(
							`error while copying client files to container ${containerName}:`,
							error
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `error while copying client files`,
							});
						return reject(error);
					} else if (stderr) {
						console.error(
							`stderr while copying client files to container ${containerName}:`,
							stderr
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while copying client files: ${stderr}`,
							});
						return reject(stderr);
					}
					if (stdout.trim() !== "")
						console.log(
							`stdout while copying client files to container ${containerName}: ${stdout}`
						);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `client files copied`,
						});
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.log(`error during copySubmissionToCContainer:`, error);
			return reject(error);
		}
	});
};
