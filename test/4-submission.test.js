const { server, chai, mocha, should, expect } = require("./test-config.js");

describe("Test submission programs at /submit:", () => {
	let socket, socketId;
	before(async () => {
		const { getConnection } = require("./test-config.js");
		socket = await getConnection();
		socketId = socket.id;
	});
	describe("Compilation error tests:", () => {
		it("should respond with errorType = compilation-error", done => {
			const payload = {
				socketId,
				code: `#include<stdio.h>\nint main() {\nprintf("Hello World!")\n}`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.errorType.should.equal("compilation-error");
					done();
				});
		});
	});
});
