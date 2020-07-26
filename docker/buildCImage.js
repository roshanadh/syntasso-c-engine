const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		/*
		 * @resolve
		 * Always resolve the stdout as resolve(stdout)
		 *
		 * @reject
		 * Reject the error and stderr values as keys in a JSON object ...
		 * ... that is, as reject({ error }) and reject({ stderr })
		 * This is because when catching rejections with .catch(error) in ...
		 * ... dockerConfigController's functions, we can see if the caught error ...
		 * ... is an error or an stderr with if (error.error) and if (error.stderr)
		 */
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
						console.error(`error during C image build:`, error);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `error during C image build`,
							});
						return reject({ error });
					} else if (stderr) {
						_stderr = stderr;
						console.error(`stderr during C image build:`, stderr);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: stderr,
							});
						return reject({ stderr });
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
			return reject({ error });
		}
	});
};
