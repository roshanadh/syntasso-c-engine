const { exec } = require("child_process");

module.exports = socketId => {
	return new Promise((resolve, reject) => {
		try {
			const containerName = socketId;

			console.log(
				`Removing any existing containers named ${containerName}...`
			);
			exec(
				`docker container rm ${containerName} --force`,
				(error, stdout, stderr) => {
					if (error) {
						if (
							!error.message.includes(
								`No such container: ${containerName}`
							)
						) {
							console.error(
								`error while removing container ${containerName}: ${error}`
							);
							return reject(error);
						} else {
							console.log(
								`No container named ${containerName} was found to be removed.`
							);
							return resolve(stdout);
						}
					} else if (
						stderr &&
						!stderr.includes(`No such container: ${containerName}`)
					) {
						console.error(
							`stderr while removing container ${containerName}: ${stderr}`
						);
						return reject(stderr);
					}
					if (stdout.trim() !== "")
						console.log(
							`stdout while removing container ${containerName}: ${stdout}`
						);
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.log(`error during removeCContainer:`, error);
			return reject(error);
		}
	});
};
