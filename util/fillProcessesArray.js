module.exports = (parsedCompilationError, testCasesCount) => {
	let processes = [];
	for (let i = 0; i < testCasesCount; i++) {
		processes.push({
			id: i,
			testStatus: false,
			timedOut: false,
			sampleInput: null,
			expectedOutput: null,
			exception: null,
			observedOutputTooLong: false,
			executionTimeForProcess: null,
			error: {
				errorType: "compilation-error",
				...parsedCompilationError,
			},
		});
	}

	return processes;
};
