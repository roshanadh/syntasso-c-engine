const { exec } = require("child_process");

const removeCContainer = require("./removeCContainer.js");
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

			let containerCreateTime;
			removeCContainer(containerName)
				.then(stdout => {
					console.log(
						`Creating a C container named ${containerName}...`
					);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `Creating a C container...`,
						});

					exec(
						`time docker create -it --name ${containerName} img_c`,
						{ shell: "/bin/bash" },
						(error, stdout, stderr) => {
							if (error) {
								console.error(
									`error during C container creation:`,
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
								 * We need to extract real(total) time/containerCreateTime from the returned timed.
								 * The times are returned as an 'stderr' object
								 */
								try {
									times = stderr.split("\n");
									// get build time in terms of 0m.000s
									containerCreateTime = times[1].split(
										"\t"
									)[1];
									return resolve({
										stdout,
										containerCreateTime: convertTimeToMs(
											containerCreateTime
										),
									});
								} catch (err) {
									// stderr contains an actual error and not execution times
									console.error(
										`stderr during C container creation:`,
										stderr
									);
									return reject({
										stderr,
									});
								}
							}
							if (stdout.trim() !== "")
								console.log(
									`stdout during C container creation: ${stdout}`
								);

							socketInstance.instance
								.to(socketId)
								.emit("docker-app-stdout", {
									stdout: `C container created`,
								});
							return resolve(stdout);
						}
					);
				})
				.catch(error => {
					reject({ error });
				});
		} catch (error) {
			console.log(`error during createCContainer:`, error);
			return reject({ error });
		}
	});
};
