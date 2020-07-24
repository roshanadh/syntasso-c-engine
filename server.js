const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);

const router = require("./routes/index.js");
const {
	PORT,
	CLIENT_PROTOCOL,
	CLIENT_HOST,
	CLIENT_PORT,
	SECRET_SESSION_KEY,
	REDIS_STORE_HOST,
	REDIS_STORE_PORT,
} = require("./config.js");

const app = express();
app.set("json spaces", 2);
app.use(
	cors({
		credentials: true,
		origin: `${CLIENT_PROTOCOL}://${CLIENT_HOST}:${CLIENT_PORT}`,
	})
);
app.use(
	session({
		secret: SECRET_SESSION_KEY,
		store: new RedisStore({
			host: REDIS_STORE_HOST,
			port: parseInt(REDIS_STORE_PORT),
			client: redis.createClient(),
		}),
		saveUninitialized: false,
		resave: false,
	})
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(router);

const server = app.listen(PORT, () =>
	console.log(`Syntasso C Engine is listening on port ${PORT}...`)
);

const socketInstance = new (require("./socket/socket"))(server);

module.exports = {
	server,
	socketInstance,
};
