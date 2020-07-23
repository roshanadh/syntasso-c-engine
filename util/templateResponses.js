module.exports.respondWith503 = res => {
	res.status(503).json({
		error: "Service currently unavailable due to server conditions",
	});
};
