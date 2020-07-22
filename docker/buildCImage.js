const { exec } = require("child_process");

module.exports = () => {
	return new Promise((resolve, reject) => {
		console.log("Building a C image...");
		exec("docker build -t img_c .", (error, stdout, stderr) => {
			if (error) {
				console.error(`error during C image build: ${error}`);
				return reject(error);
			} else if (stderr) {
				console.error(`stderr during C image build: ${stderr}`);
				return reject(error);
			}
			if (stdout.trim() !== "")
				console.log(`stdout during C image build: ${stdout}`);
			return resolve(stdout);
		});
	});
};
