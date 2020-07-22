const { exec } = require("child_process");

const removeCContainer = require("./removeCContainer.js");

module.exports = containerName => {
	return new Promise((resolve, reject) => {
		removeCContainer(containerName)
			.then(stdout => {
				console.log(`Creating a C container named ${containerName}...`);
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
							return reject(error);
						}
						if (stdout.trim() !== "")
							console.log(
								`stdout during C container creation: ${stdout}`
							);
						return resolve(stdout);
					}
				);
			})
			.catch(error => {
				reject(error);
			});
	});
};
