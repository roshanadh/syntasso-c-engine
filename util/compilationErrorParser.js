module.exports = (error, socketId) => {
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

		return {
			errorMessage,
			lineNumber,
			columnNumber,
			errorStack,
		};
	} catch (error) {
		console.error(`error in compilationErrorParser.js:`, error);
		return {
			errorInParser: error,
		};
	}
};
