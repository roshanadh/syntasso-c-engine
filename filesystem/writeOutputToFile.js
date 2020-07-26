const fs = require("fs");
const path = require("path");

module.exports = (socketId, output) => {
	return new Promise((resolve, reject) => {
		const outputsFileName = `${socketId}.txt`;
		const outputsFilePath = path.resolve(
			__dirname,
			"..",
			"client-files",
			"outputs",
			outputsFileName
		);
		console.log(`Writing to output file ${socketId}.txt...`);
		fs.writeFile(outputsFilePath, output, error => {
			if (error) {
				console.error(
					`error while writing to output file ${socketId}.txt:`,
					error
				);
				return reject(error);
			}
			console.log(`Output written to file ${socketId}.txt.`);
			return resolve(outputsFileName);
		});
	});
};
