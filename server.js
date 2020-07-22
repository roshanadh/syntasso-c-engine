const express = require("express");
const bodyParser = require("body-parser");

const router = require("./routes/index.js");
const { PORT } = require("./config.js");

const app = express();
app.set("json spaces", 2);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(router);

const server = app.listen(PORT, () =>
	console.log(`Syntasso C Engine is listening on port ${PORT}...`)
);

module.exports = server;
