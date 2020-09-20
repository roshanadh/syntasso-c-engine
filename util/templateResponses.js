module.exports.respondWithError = (res, code, errorMessage) => {
	res.status(503).json({
		error: errorMessage,
	});
	return console.log("Response sent to the client:", {
		error: errorMessage,
	});
};
