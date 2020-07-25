const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

module.exports = socketId => {
	// remove the submission files directory and output file of the socketId
	return new Promise((resolve, reject) => {
		let outputFilePath, submissionFilesPath;
		try {
			outputFilePath = path.resolve(
				__dirname,
				"..",
				"client-files",
				"outputs",
				`${socketId}.txt`
			);
			submissionFilesPath = path.resolve(
				__dirname,
				"..",
				"client-files",
				socketId
			);

			console.log(
				`Removing temporary files directory for socket ID ${socketId}...`
			);
			if (process.env.NODE_ENV === "test") {
				// remove the submission files directory
				// if in testing env, use the sync method
				rimraf.sync(submissionFilesPath);
				console.log(
					`Removed temporary files directory for socket ID ${socketId}`
				);

				// remove the output file
				fs.unlinkSync(outputFilePath);
				console.log(`Removed output file for socket ID ${socketId}`);
				return resolve(socketId);
			} else {
				// remove submission files directory

				// if in env other than test, use the async method
				rimraf(submissionFilesPath, error => {
					if (error && error.code !== "ENOENT") {
						console.error(
							`error while removing temporary files directory recursively for socket ID ${socketId}:`,
							error
						);
						return reject(error);
					}

					// remove output file
					fs.unlink(outputFilePath, error => {
						if (error && error.code !== "ENOENT") {
							console.error(
								`error while removing output file for socket ID ${socketId}:`,
								error
							);
							return reject(error);
						}
						return resolve(socketId);
					});
				});
			}
		} catch (error) {
			if (error.code === "ENOENT") return resolve(submissionFilesPath);

			console.error(`error inside cleanUpTempFiles:`, error);
			reject(error);
		}
	});
};
