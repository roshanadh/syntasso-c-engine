const compilationTerminationParser = error => {
	const splitError = error.split(":");
	const lineNumber = splitError[0];
	const columnNumber = splitError[1];
	const errorStack = splitError.slice(2).join(":");
	return {
		lineNumber,
		columnNumber,
		errorStack,
	};
};

module.exports = (error, socketId) => {
	// Parses compilation error, compilation terminations, and linker errors

	/*
	 * compilation error sample:
	 * 	s-c7f938d272062af924.c: In function 'main':
	 *	s-c7f938d272062af924.c:3:1: error: expected declaration or statement at end of input
	 *	printf("Hello World!");
	 *	^~~~~~
	 */
	try {
		let errorMessage, lineNumber, columnNumber, errorStack;

		errorStack = error;
		// trim first occurrence of file name
		error = errorStack.substring(
			errorStack.indexOf(`${socketId}.c: `) + `${socketId}.c: `.length
		);
		// get line number and column number
		lineNumber = error.toString().split(":")[2];
		columnNumber = error.toString().split(":")[3];
		// get error message
		errorMessage = error.split(
			`${socketId}.c:${lineNumber}:${columnNumber}: `
		)[1];
		// trim code portion from errorMessage
		errorMessage = errorMessage.split("\n")[0];

		// if any error hasn't been thrown up to here, it's a ...
		// ... compilation error, so no need to update errorType
		return {
			errorMessage,
			lineNumber,
			columnNumber,
			errorStack,
		};
	} catch (caughtError) {
		// TODO:
		// check if it's a Linker Error as some Linker Errors cannot be ...
		// ... parsed as above and throws an error in the process
		if (error.includes("undefined reference to")) {
			// "undefined reference to" is one of the most common ...
			// ... Linker Errors

			// if it is a Linker Error, update errorType to say: linker-error

			return {
				newErrorType: "linker-error",
				errorStack: error,
			};
		}

		// check for any compilation terminations
		if (error.includes("compilation terminated")) {
			// this is an instance of compilation error
			let {
				lineNumber,
				columnNumber,
				errorStack,
			} = compilationTerminationParser(error);
			return {
				lineNumber,
				columnNumber,
				errorStack,
			};
		}
		console.error(`error in compilationErrorParser.js:`, caughtError);
		return {
			errorInParser: caughtError,
		};
	}
};
