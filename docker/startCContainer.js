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
			const containerName = socketId;

			let containerStartTime;
			console.log(`Starting a C container named ${containerName}...`);
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: `Starting the C container...`,
			});

			exec(
				`time docker container start ${containerName}`,
				{ shell: "/bin/bash" },
				(error, stdout, stderr) => {
					if (error) {
						console.error(
							`error while starting container ${containerName}:`,
							error
						);
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
						 * We need to extract real(total) time/containerStartTime from the returned timed.
						 * The times are returned as an 'stderr' object
						 */
						try {
							times = stderr.split("\n");
							// get build time in terms of 0m.000s
							containerStartTime = times[1].split("\t")[1];
							return resolve({
								stdout,
								containerStartTime: convertTimeToMs(
									containerStartTime
								),
							});
						} catch (err) {
							// stderr contains an actual error and not execution times
							console.error(
								`stderr while starting container ${containerName}:`,
								stderr
							);
							return reject({ stderr });
						}
					}
					if (stdout.trim() !== "")
						console.log(
							`stdout while starting container ${containerName}: ${stdout}`
						);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `C container started`,
						});
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.log(`error during startCContainer:`, error);
			return reject({ error });
		}
	});
};
