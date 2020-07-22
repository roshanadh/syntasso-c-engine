const { exec } = require("child_process");

module.exports = containerName => {
	return new Promise((resolve, reject) => {
		console.log(`Starting a C container named ${containerName}...`);
		exec(
			`docker container start ${containerName}`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(
						`error while starting container ${containerName}: ${error}`
					);
					return reject(error);
				} else if (stderr) {
					console.error(
						`stderr while starting container ${containerName}: ${stderr}`
					);
					return reject(error);
				}
				if (stdout.trim() !== "")
					console.log(
						`stdout while starting container ${containerName}: ${stdout}`
					);
				return resolve(stdout);
			}
		);
	});
};
