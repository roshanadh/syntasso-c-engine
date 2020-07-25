const { exec } = require("child_process");

let output;
const submission = exec("./submission");

submission.stdout.on("data", stdout => {
	process.stdout.write(JSON.stringify({ stdout }));
});

submission.stderr.on("data", stderr => {
	process.stderr.write(JSON.stringify({ stderr }));
});
