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
	if (!req.body.testCases || req.body.testCases.length === 0) return false;
	return true;
};
