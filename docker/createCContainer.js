const { exec } = require("child_process");

const removeCContainer = require("./removeCContainer.js");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			const containerName = socketId;

			removeCContainer(req, socketInstance)
				.then(stdout => {
					console.log(
						`Creating a C container named ${containerName}...`
					);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `Creating a C container...`,
						});

					exec(
						`docker create -it --name ${containerName} img_c`,
						(error, stdout, stderr) => {
							if (error) {
								console.error(
									`error during C container creation: ${error}`
								);
								return reject(error);
							} else if (stderr) {
								console.error(
									`stderr during C container creation: ${stderr}`
								);
								return reject(stderr);
							}
							if (stdout.trim() !== "")
								console.log(
									`stdout during C container creation: ${stdout}`
								);

							socketInstance.instance
								.to(socketId)
								.emit("docker-app-stdout", {
									stdout: `C container created`,
								});
							return resolve(stdout);
						}
					);
				})
				.catch(error => {
					reject(error);
				});
		} catch (error) {}
	});
};
