"use strict";

const { spawnSync } = require("child_process");

const readTestFiles = require("./read-test-files.js");

const socketId = process.env.socketId.trim();

// execution of each submission file times out after a certain period
const EXECUTION_TIME_OUT_IN_MS = 2000;
// max length of stdout for each cProcess
const MAX_LENGTH_STDOUT = 2000;

let sampleInputs,
	expectedOutputs,
	sampleInputFileContents,
	expectedOutputFileContents,
	// response object to be sent to the process that executes main-wrapper.js
	response = {
		timeOutLength: EXECUTION_TIME_OUT_IN_MS,
		observedOutputMaxLength: MAX_LENGTH_STDOUT,
	};

try {
	readTestFiles(socketId)
		.then(response => {
			({ sampleInputs, expectedOutputs } = response);
			main();
		})
		.catch(err => {
			// TODO: handle different promise rejections from readTestFiles
			if (
				err.message === "No test files have been generated" ||
				err.message ===
					"Number of sampleInput and expectedOutput files mismatch"
			) {
				// spawn one process and do not pass any sample input to it
				try {
					const cProcess = spawnSync("./submission", {
						timeout: EXECUTION_TIME_OUT_IN_MS,
					});
					const io = cProcess.output;
					const stdout =
						io[1].toString().length <= MAX_LENGTH_STDOUT
							? io[1].toString()
							: null;
					const stderr = io[2].toString();

					if (stderr === "") {
						// no stderr was generated during the execution
						// testStatus will be null because no test files have been ...
						// ... generated
						const testStatus = null;
						response = {
							sampleInputs: 0,
							testStatus,
							// if cProcess timed out, its signal would be SIGTERM by default ...
							// ... otherwise, its signal would be null
							timedOut:
								cProcess.signal === "SIGTERM" ? true : false,
							timeOutLength: EXECUTION_TIME_OUT_IN_MS,
							expectedOutput: null,
							observedOutput: stdout,
							// if length of stdout is larger than MAX length permitted, ...
							// ... set stdout as null and specify reason in response object
							observedOutputTooLong:
								stdout === null ? true : false,
							observedOutputMaxLength: MAX_LENGTH_STDOUT,
						};
						process.stdout.write(
							Buffer.from(JSON.stringify(response))
						);
					} else {
						// stderr was generated during the execution, so parse error ...
						// ... from stderr
						process.stderr.write(
							Buffer.from(
								JSON.stringify({
									type: "stderr",
									...stderr,
								})
							)
						);
					}
				} catch (err) {
					throw new Error(err);
				}
			} else throw new Error(err);
		});
} catch (error) {
	console.error(
		`Error occurred during execution of main-wrapper.js inside container ${socketId}`,
		error
	);
}

const main = () => {
	for (let i = 0; i < sampleInputs.length; i++) {
		try {
			const cProcess = spawnSync("./submission", {
				input: writeToStdin(sampleInputs.files[i]),
				timeout: EXECUTION_TIME_OUT_IN_MS,
			});

			const io = cProcess.output;
			const stdout =
				io[1].toString().length <= MAX_LENGTH_STDOUT
					? io[1].toString()
					: null;
			const stderr = io[2].toString();

			if (stderr === "") {
				// no stderr was generated
				expectedOutputFileContents = expectedOutputs.fileContents[
					expectedOutputs.files[i]
				].toString();

				let testStatus =
					expectedOutputFileContents === stdout ? true : false;

				response[`sampleInput${i}`] = {
					testStatus,
					// if cProcess timed out, its signal would be SIGTERM by default ...
					// ... otherwise, its signal would be null
					timedOut: cProcess.signal === "SIGTERM" ? true : false,
					sampleInput: sampleInputs.fileContents[
						sampleInputs.files[i]
					].toString(),
					expectedOutput: expectedOutputFileContents.toString(),
					observedOutput: stdout,
					// if length of stdout is larger than MAX length permitted, ...
					// ... set stdout as null and specify reason in response object
					observedOutputTooLong: stdout === null ? true : false,
				};

				// write to stdout to indicate completion of test #i
				process.stdout.write(
					Buffer.from(
						JSON.stringify({
							type: "test-status",
							process: i,
							testStatus,
							timedOut:
								cProcess.signal === "SIGTERM" ? true : false,
						})
					)
				);
			} else {
				// stderr was generated, so parse error from stderr
				process.stderr.write(
					Buffer.from(
						JSON.stringify({
							type: "stderr",
							...stderr,
						})
					)
				);
			}
		} catch (err) {
			throw new Error(err);
		}
	}
	// write the final response to stdout
	process.stdout.write(
		Buffer.from(JSON.stringify({ type: "full-response", ...response }))
	);
};

const writeToStdin = sampleInput => {
	sampleInputFileContents = sampleInputs.fileContents[sampleInput].toString();
	sampleInputFileContents = sampleInputFileContents.split("\n");
	sampleInputFileContents = JSON.stringify(sampleInputFileContents);

	return JSON.stringify({
		sampleInputId: sampleInput,
		fileContents: sampleInputFileContents,
	});
};
