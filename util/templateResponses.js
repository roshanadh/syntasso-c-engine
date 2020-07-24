module.exports.respondWithError = (res, code, errorMessage) => {
	res.status(503).json({
		error: errorMessage,
	});
};
