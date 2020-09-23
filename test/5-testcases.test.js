const { server, chai, mocha, should, expect } = require("./test-config.js");

describe("Test validation of test cases at /submit:", () => {
	let socket, socketId;
	before(async () => {
		const { getConnection } = require("./test-config.js");
		socket = await getConnection();
		socketId = socket.id;
	});
	it("should respond with testStatus = true", done => {
		const payload = {
			socketId,
			// stub with code to calculate area of a rectangle
			code: `#include <stdio.h>\n #include <stdlib.h>\n #include <string.h>\n #define TRUE 1\n #define FALSE 0\n #define SAMPLE_INPUT_MAX_LINES 500\n int parseRawSampleInput(); char *readLine(); char *rawSampleInput; char *sampleInput[SAMPLE_INPUT_MAX_LINES]; int len_sampleInput = 0; int currentLine = 0; int calcArea(int length, int breadth) { return length * breadth; } int main(int argc, char *argv[]) { if (argc == 2) { rawSampleInput = argv[1]; int isParsed = parseRawSampleInput(rawSampleInput); if (isParsed == FALSE) { fprintf(stderr, "Length of sample input lines exceeded 500"); return -1; } int length = atoi(readLine()); int breadth = atoi(readLine()); int output = calcArea(length, breadth); printf("%d", output); } else if (argc > 2) { fprintf(stderr, "Too Many Inputs Provided"); return -1; } else { fprintf(stderr, "No Input Provided"); return -1; } } int parseRawSampleInput(char *rawSampleInput) { char *token = strtok(rawSampleInput, "\\n"); int counter = 0; while (token != NULL && len_sampleInput <= SAMPLE_INPUT_MAX_LINES) { sampleInput[counter++] = token; len_sampleInput++; token = strtok(NULL, "\\n"); } if (len_sampleInput > SAMPLE_INPUT_MAX_LINES) return FALSE; return TRUE; } char *readLine() { return sampleInput[currentLine++]; }`,
			dockerConfig: "2",
			testCases: [{ sampleInput: "5\n2", expectedOutput: "10" }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.sampleInputs.should.equal(1);
				expect(res.body.error).to.be.null;
				expect(res.body.sampleInput0.testStatus).to.be.true;
				done();
			});
	});
	it("should respond with testStatus = false", done => {
		const payload = {
			socketId,
			// stub with code to calculate area of a rectangle
			code: `#include <stdio.h>\n #include <stdlib.h>\n #include <string.h>\n #define TRUE 1\n #define FALSE 0\n #define SAMPLE_INPUT_MAX_LINES 500\n int parseRawSampleInput(); char *readLine(); char *rawSampleInput; char *sampleInput[SAMPLE_INPUT_MAX_LINES]; int len_sampleInput = 0; int currentLine = 0; int calcArea(int length, int breadth) { return length * breadth; } int main(int argc, char *argv[]) { if (argc == 2) { rawSampleInput = argv[1]; int isParsed = parseRawSampleInput(rawSampleInput); if (isParsed == FALSE) { fprintf(stderr, "Length of sample input lines exceeded 500"); return -1; } int length = atoi(readLine()); int breadth = atoi(readLine()); int output = calcArea(length, breadth); printf("%d", output); } else if (argc > 2) { fprintf(stderr, "Too Many Inputs Provided"); return -1; } else { fprintf(stderr, "No Input Provided"); return -1; } } int parseRawSampleInput(char *rawSampleInput) { char *token = strtok(rawSampleInput, "\\n"); int counter = 0; while (token != NULL && len_sampleInput <= SAMPLE_INPUT_MAX_LINES) { sampleInput[counter++] = token; len_sampleInput++; token = strtok(NULL, "\\n"); } if (len_sampleInput > SAMPLE_INPUT_MAX_LINES) return FALSE; return TRUE; } char *readLine() { return sampleInput[currentLine++]; }`,
			dockerConfig: "2",
			testCases: [{ sampleInput: "5\n20", expectedOutput: "10" }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.sampleInputs.should.equal(1);
				expect(res.body.error).to.be.null;
				expect(res.body.sampleInput0.testStatus).to.be.false;
				done();
			});
	});
	it("should respond with timedOut = true", done => {
		const payload = {
			socketId,
			// print i after an infinite loop
			code: `#include <stdio.h>\nint main(){int i; for (i = 0; i < 1; i--) {} printf("i = %d", i);}`,
			dockerConfig: "2",
			testCases: [{ sampleInput: 0, expectedOutput: 0 }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.sampleInputs.should.equal(1);
				expect(res.body.error).to.be.null;
				expect(res.body.timeOutLength).to.equal(2000);
				expect(res.body.observedOutputMaxLength).to.equal(2000);
				expect(res.body.sampleInput0.timedOut).to.be.true;
				expect(res.body.sampleInput0.observedOutputTooLong).to.be.false;
				expect(res.body.sampleInput0.testStatus).to.be.false;
				done();
			});
	});
	it("should respond with observedOutputTooLong = true", done => {
		const payload = {
			socketId,
			// print i inside an infinite loop
			code: `#include <stdio.h>\nint main(){int i; for (i = 0; i < 1; i--) {printf("i = %d", i);}}`,
			dockerConfig: "2",
			testCases: [{ sampleInput: 0, expectedOutput: 0 }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.sampleInputs.should.equal(1);
				expect(res.body.error).to.be.null;
				expect(res.body.timeOutLength).to.equal(2000);
				expect(res.body.observedOutputMaxLength).to.equal(2000);
				expect(res.body.sampleInput0.timedOut).to.be.true;
				expect(res.body.sampleInput0.observedOutputTooLong).to.be.true;
				expect(res.body.sampleInput0.testStatus).to.be.false;
				done();
			});
	});
});
