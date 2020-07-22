const { exec } = require("child_process");

module.exports = containerName => {
	return new Promise((resolve, reject) => {
		console.log(
			`Executing user's submission in container ${containerName}`
		);
		exec(
			`docker exec -i ${containerName} ./submission`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(
						`error while executing submission inside container ${containerName}: ${error}`
					);
					return reject(error);
				} else if (stderr) {
					console.error(
						`stderr while executing submission inside container ${containerName}: ${stderr}`
					);
					return reject(error);
				}
				if (stdout.trim() !== "")
					console.log(
						`stdout while executing submission inside container ${containerName}: ${stdout}`
					);
				return resolve(stdout);
			}
		);
	});
};
