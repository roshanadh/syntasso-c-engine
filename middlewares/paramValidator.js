module.exports.socketValidator = req => {
	const { socketInstance } = require("../server.js");
	const listOfClients = Object.keys(socketInstance.instance.sockets.sockets);

	if (!req.body.socketId) return "no-socket";
	if (!listOfClients.includes(req.body.socketId)) return "unknown-socket";
	req.session.socketId = req.body.socketId;
};

module.exports.codeValidator = req => (req.body.code ? true : false);

module.exports.dockerConfigValidator = req => {
	if (!req.body.dockerConfig) return "no-config";
	else if (isNaN(req.body.dockerConfig)) return "NaN";
	else if (![0, 1, 2].includes(parseInt(req.body.dockerConfig)))
		return "no-valid-config";
	else return "ok";
};

module.exports.testCasesValidator = req => {
	if (!req.body.testCases || req.body.testCases.length === 0)
		return "no-test-cases";
	/*
	 * req.body.testCases exists as of here
	 * However, req.body.testCases can contain some escape sequences like: \n, \t, ...
	 * ... etc. These escape sequences will be received within req.body.testCases with ...
	 * ... extra an backslash, i.e., \n will be received as \\n
	 * This will cause problems while parsing the sampleInput inside the C stub program.
	 * To prevent it, we need to replace such multiple consecutive backslashes with a single '\', ...
	 * ... as follows.
	 */
	const escapeSequenceRegex = new RegExp(/(\\){2,}/, "g");
	const testCases = JSON.stringify(req.body.testCases).replace(
		escapeSequenceRegex,
		"\\"
	);
	// overwrite existing req.body.testCases with the altered testCases
	req.body.testCases = JSON.parse(testCases);
	if (!Array.isArray(req.body.testCases)) return "not-an-array";
	return "ok";
};
