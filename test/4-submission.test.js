const { server, chai, mocha, should, expect } = require("./test-config.js");

describe("Test submission programs at /submit:", () => {
	let socket, socketId;
	before(async () => {
		const { getConnection } = require("./test-config.js");
		socket = await getConnection();
		socketId = socket.id;
	});
	describe("Compilation error tests:", () => {
		it("should respond with errorType = compilation-error for syntax error", done => {
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
					res.body.error.should.be.a("object");
					res.body.error.type.should.equal("compilation-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
		it("should respond with errorType = compilation-error for mis-linked library", done => {
			const payload = {
				socketId,
				code: `#include<stdio>
						int main()
						{
							return 0;
						}
					`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.type.should.equal("compilation-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
		it("should respond with errorType = compilation-error for fatal implicit-function-declaration warning", done => {
			const payload = {
				socketId,
				code: `#include<stdio.h>\nint main(){\nfoo();\n}`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.type.should.equal("compilation-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
	});

	describe("Linker error tests:", () => {
		it("should respond with errorType = linker-error", done => {
			const payload = {
				socketId,
				code: `#include "stdio.h"
						void Foo();
						int main()
						{
							Foo();
							return 0;
						}
						void foo(){}
					`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.type.should.equal("linker-error");
					done();
				});
		});
	});
});
