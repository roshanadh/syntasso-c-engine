const path = require("path");
const rimraf = require("rimraf");

module.exports = socketId => {
	return new Promise((resolve, reject) => {
		let basePath;
		try {
			basePath = path.resolve(__dirname, "..", "client-files", socketId);

			console.log(
				`Removing temporary files directory for socket ID ${socketId}...`
			);
			if (process.env.NODE_ENV === "test") {
				// if in testing env, use the sync method
				rimraf.sync(basePath);
				console.log(
					`Removed temporary files directory for socket ID ${socketId}`
				);
			} else {
				rimraf(basePath, error => {
					// if in other envs, use the async method
					if (error && error.code !== "ENOENT") {
						console.error(
							`error while removing temporary files directory recursively:`,
							error
						);
						return reject(error);
					}
					return resolve(basePath);
				});
			}
		} catch (error) {
			if (error.code === "ENOENT") return resolve(basePath);

			console.error(`error inside initDirectories:`, error);
			reject(error);
		}
	});
};
