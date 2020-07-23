const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			console.log("Building a C image...");
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: "Building a C image...",
			});

			let _error, _stdout, _stderr;

			const imgBuildProcess = exec(
				"docker build -t img_c .",
				(error, stdout, stderr) => {
					if (error) {
						_error = error;
						console.error(`error during C image build: ${error}`);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `error during C image build: ${error}`,
							});
						return reject(error);
					} else if (stderr) {
						_stderr = stderr;
						console.error(`stderr during C image build: ${stderr}`);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: stderr,
							});
						return reject(stderr);
					}
				}
			);

			imgBuildProcess.stdout.on("data", stdout => {
				_stdout = stdout;
				console.log(`stdout during C image build: ${stdout}`);
				socketInstance.instance.to(socketId).emit("docker-app-stdout", {
					stdout,
				});
			});

			imgBuildProcess.on("close", code => {
				return resolve(_stdout);
			});
		} catch (error) {
			console.log(`error during buildCImage:`, error);
			return reject(error);
		}
	});
};
