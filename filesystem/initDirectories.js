const fs = require("fs");
const path = require("path");

module.exports = socketId => {
	return new Promise((resolve, reject) => {
		try {
			const outputsPath = path.resolve(
				__dirname,
				"..",
				"client-files",
				"outputs"
			);

			const submissionPath = path.resolve(
				__dirname,
				"..",
				"client-files",
				socketId
			);

			fs.mkdir(outputsPath, { recursive: true }, (error, path) => {
				if (error && error.code !== "EEXIST") {
					console.error(
						`error while creating outputs directory recursively:`,
						error
					);
					return reject(error);
				}
				fs.mkdir(submissionPath, { recursive: true }, (error, path) => {
					if (error && error.code !== "EEXIST") {
						console.error(
							`error while creating ${socketId} directory recursively:`,
							error
						);
						return reject(error);
					}
					return resolve(submissionPath);
				});
			});
		} catch (error) {
			console.error(`error inside initDirectories:`, error);
			reject(error);
		}
	});
};
