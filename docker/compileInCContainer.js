const { exec } = require("child_process");

module.exports = (containerName, submissionFileName) => {
	return new Promise((resolve, reject) => {
		console.log(
			`Compiling user's submission in container ${containerName}`
		);
		console.log(submissionFileName);
		exec(
			`docker exec -i ${containerName} gcc ${submissionFileName} -o submission`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(
						`error while compiling submission inside container ${containerName}: ${error}`
					);
					return reject(error);
				} else if (stderr) {
					console.error(
						`stderr while compiling submission inside container ${containerName}: ${stderr}`
					);
					return reject(error);
				}
				if (stdout.trim() !== "")
					console.log(
						`stdout while compiling submission inside container ${containerName}: ${stdout}`
					);
				return resolve(stdout);
			}
		);
	});
};
