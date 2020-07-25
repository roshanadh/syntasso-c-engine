const { exec, execSync } = require("child_process");

module.exports = socketId => {
	return new Promise((resolve, reject) => {
		try {
			const containerName = socketId;

			console.log(
				`Removing any existing containers named ${containerName}...`
			);
			// if the engine is run on an testing environment, use the sync function ...
			// ... otherwise, use the async function
			if (process.env.NODE_ENV === "test") {
				let stdout, stderr;
				try {
					const removeProcess = execSync(
						`docker container rm ${containerName} --force`
					);
					({ stdout, stderr } = removeProcess);
					if (stderr && stderr.trim() !== "") {
						console.error(
							`stderr while removing container ${containerName}:`,
							stderr
						);
						return reject(stderr);
					}

					stdout = stdout ? stdout : "";
					console.log(
						`stdout while removing container ${containerName}: ${stdout}`
					);
					console.log(`C container named ${containerName} removed.`);
					return resolve(stdout);
				} catch (error) {
					if (
						!error.message.includes(
							`No such container: ${containerName}`
						)
					) {
						console.error(
							`error while removing container ${containerName}:`,
							error
						);
						return reject(error);
					} else {
						console.log(
							`No container named ${containerName} was found to be removed.`
						);
						return resolve(stdout);
					}
				}
			}
			// else: NODE_ENV is not "test", so use async function
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
								`error while removing container ${containerName}:`,
								error
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
							`stderr while removing container ${containerName}:`,
							stderr
						);
						return reject(stderr);
					}
					if (stdout.trim() !== "")
						console.log(
							`stdout while removing container ${containerName}: ${stdout}`
						);
					console.log(`C container named ${containerName} removed.`);
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.log(`error during removeCContainer:`, error);
			return reject(error);
		}
	});
};
