const { exec } = require("child_process");

const convertTimeToMs = require("../util/convertTimeToMs.js");

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

			let _error, _stdout, _stderr, imageBuildTime;

			const imgBuildProcess = exec(
				"time docker build -t img_c .",
				{ shell: "/bin/bash" },
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
						let times;
						/*
						 * 'time' command returns the real(total), user, and sys(system) ...
						 * ... times for the execution of following command (e.g. docker build ... )
						 * The times are returned in the following structure:
						 * ++++++++++++++++++
						 * + real\t0m0.000s +
						 * + user\t0m0.000s +
						 * + sys\t0m0.000s  +
						 * ++++++++++++++++++
						 * Note: 0m0.000s = 0minutes and 0.000 seconds
						 * We need to extract real(total) time/imageBuildTime from the returned timed.
						 * The times are returned as an 'stderr' object
						 */
						try {
							times = stderr.split("\n");
							// get build time in terms of 0m.000s
							imageBuildTime = times[1].split("\t")[1];
							return resolve({
								stdout: _stdout,
								imageBuildTime: convertTimeToMs(imageBuildTime),
							});
						} catch (err) {
							// stderr contains an actual error and not execution times
							_stderr = stderr;
							console.error(
								`stderr during C image build:`,
								stderr
							);
							socketInstance.instance
								.to(socketId)
								.emit("docker-app-stdout", {
									stdout: stderr,
								});
							return reject({ stderr });
						}
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
		} catch (error) {
			console.log(`error during buildCImage:`, error);
			return reject({ error });
		}
	});
};
