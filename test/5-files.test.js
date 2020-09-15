const fs = require("fs");
const path = require("path");

const { server, chai, mocha, should, expect } = require("./test-config.js");

describe("Test generation of files at /submit:", () => {
	let socket,
		socketId,
		submissionFilePath,
		sampleInputsDirPath,
		expectedOutputsDirPath;
	before(async () => {
		const { getConnection } = require("./test-config.js");
		socket = await getConnection();
		socketId = socket.id;

		submissionFilePath = path.resolve(
			__dirname,
			"..",
			"client-files",
			socketId,
			`${socketId}.c`
		);
		sampleInputsDirPath = path.resolve(
			__dirname,
			"..",
			"client-files",
			socketId,
			"sampleInputs"
		);
		expectedOutputsDirPath = path.resolve(
			__dirname,
			"..",
			"client-files",
			socketId,
			"expectedOutputs"
		);
	});
	it("should generate submission.c file", done => {
		const payload = {
			socketId,
			code: `#include<stdio.h>\nint main() {\nprintf("Hello World!");\n}`,
			dockerConfig: "2",
			testCases: [{ sampleInput: 0, expectedOutput: 0 }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.observedOutput.should.equal("Hello World!");
				expect(fs.existsSync(submissionFilePath)).to.be.true;
				done();
			});
	});
});
