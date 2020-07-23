require("dotenv").config();

if (!process.env) throw new Error("Environment variable(s) not set.");

module.exports = {
	PORT: process.env.PORT || 8081,
	CLIENT_PROTOCOL: process.env.CLIENT_PROTOCOL,
	CLIENT_HOST: process.env.CLIENT_HOST,
	CLIENT_PORT: process.env.CLIENT_PORT,
};
