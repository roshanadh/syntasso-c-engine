const { server, chai, mocha, should, expect } = require("./test-config.js");

describe("Test different errorful submissions at /submit:", () => {
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
				testCases: [{ sampleInput: 0, expectedOutput: 0 }],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("compilation-error");
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
				testCases: [{ sampleInput: 0, expectedOutput: 0 }],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("compilation-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
		it("should respond with errorType = compilation-error for div-by-zero", done => {
			const payload = {
				socketId,
				code: `#include "stdio.h"\nint main(){\nint a = 10 / 0;\nreturn 0;\n}`,
				testCases: [{ sampleInput: 0, expectedOutput: 0 }],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("compilation-error");
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
				testCases: [{ sampleInput: 0, expectedOutput: 0 }],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("linker-error");
					done();
				});
		});
		it("should respond with errorType = linker-error for undefined reference to function", done => {
			const payload = {
				socketId,
				code: `#include<stdio.h>\nint main(){\nfoo();\n}`,
				testCases: [{ sampleInput: 0, expectedOutput: 0 }],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("linker-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
	});

	describe("Runtime error tests:", () => {
		// TODO: Write runtime error tests
	});
});
