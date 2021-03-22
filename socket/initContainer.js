const {
	buildCImage,
	createCContainer,
	startCContainer,
} = require("../docker/index.js");
const { logger } = require("../util/index.js");

module.exports = (socketId, socketInstance) => {
	return new Promise((resolve, reject) => {
		let times = {};
		socketInstance.to(socketId).emit("container-init-status", {
			status: "building",
			message: "Building a C image...",
			error: null,
		});
		buildCImage(socketId, socketInstance)
			.then(buildLogs => {
				times.imageBuildTime = buildLogs.imageBuildTime;
				socketInstance.to(socketId).emit("container-init-status", {
					status: "creating",
					times,
					message: "Creating a C container...",
					error: null,
				});
				return createCContainer(socketId, socketInstance);
			})
			.then(creationLogs => {
				times.containerCreateTime = creationLogs.containerCreateTime;
				socketInstance.to(socketId).emit("container-init-status", {
					status: "starting",
					times,
					message: "Starting the C container...",
					error: null,
				});
				return startCContainer(socketId, socketInstance);
			})
			.then(startLogs => {
				times.containerStartTime = startLogs.containerStartTime;
				socketInstance.to(socketId).emit("container-init-status", {
					status: "ready",
					times,
					message: "Container is ready.",
					error: null,
				});
				// "container-ready-status" event is strictly for testing
				// clients may only listen for the "container-init-status" events
				socketInstance.to(socketId).emit("container-ready-status", {
					status: "ready",
					times,
					message: "Container is ready.",
					error: null,
				});
				return resolve(socketId);
			})
			.catch(error => {
				logger.error("Error in initContainer:", error);
				socketInstance.to(socketId).emit("container-init-status", {
					status: "error",
					message: "Please re-establish a socket connection",
					error,
				});
				reject(error);
			});
	});
};
