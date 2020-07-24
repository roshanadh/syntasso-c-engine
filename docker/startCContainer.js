const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			const containerName = socketId;

			console.log(`Starting a C container named ${containerName}...`);
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: `Starting the C container...`,
			});

			exec(
				`docker container start ${containerName}`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(
							`error while starting container ${containerName}:`,
							error
						);
						return reject(error);
					} else if (stderr) {
						console.error(
							`stderr while starting container ${containerName}:`,
							stderr
						);
						return reject(stderr);
					}
					if (stdout.trim() !== "")
						console.log(
							`stdout while starting container ${containerName}: ${stdout}`
						);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `C container started`,
						});
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.log(`error during startCContainer:`, error);
			return reject(error);
		}
	});
};
