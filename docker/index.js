module.exports = {
	buildCImage: require("./buildCImage.js"),
	createCContainer: require("./createCContainer.js"),
	startCContainer: require("./startCContainer.js"),
	copyClientFilesToCContainer: require("./copyClientFilesToCContainer"),
	compileInCContainer: require("./compileInCContainer.js"),
	execInCContainer: require("./execInCContainer.js"),
	removeCContainer: require("./removeCContainer.js"),
};
