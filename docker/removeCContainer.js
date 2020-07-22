const { exec } = require("child_process");

module.exports = containerName => {
	return new Promise((resolve, reject) => {
		console.log(
			`Removing any existing containers named ${containerName}...`
		);
		exec(
			`docker container rm ${containerName} --force`,
			(error, stdout, stderr) => {
				if (
					error &&
					!error.message.includes(
						`No such container: ${containerName}`
					)
				) {
					console.error(
						`error while removing container ${containerName}: ${error}`
					);
					return reject(error);
				} else if (
					stderr &&
					!stderr.includes(`No such container: ${containerName}`)
				) {
					console.error(
						`stderr while removing container ${containerName}: ${stderr}`
					);
					return reject(error);
				}
				if (stdout.trim() !== "")
					console.log(
						`stdout while removing container ${containerName}: ${stdout}`
					);
				return resolve(stdout);
			}
		);
	});
};
