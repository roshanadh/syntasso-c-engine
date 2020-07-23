const fs = require("fs");
const path = require("path");

module.exports = req => {
	const fileName = `${req.body.socketId}.c`;
	const filePath = path.resolve(
		__dirname,
		"..",
		"client-files",
		"submission",
		fileName
	);

	const { code } = req.body;
	return new Promise((resolve, reject) => {
		console.log(`Generating submission file named ${fileName}`);
		fs.writeFile(filePath, code, error => {
			if (error) {
				console.error(
					`error while generating submission file: ${error}`
				);
				return reject(error);
			}
			console.log(`Submission file ${fileName} generated.`);
			return resolve(fileName);
		});
	});
};
