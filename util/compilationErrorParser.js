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

		// if lineNumber or columnNumber are NaN, some error has occurred ...
		// ... during parsing
		if (isNaN(lineNumber) || isNaN(columnNumber)) {
			/*
			 * this may be due to a Linker Error
			 * Linker Errors may look like:
			 * s-bf060be7a5b6ff7a93.c:(.text+0xa): undefined reference to `Foo'
			 * collect2: error: ld returned 1 exit status
			 *
			 * This Linker Error will be parsed with lineNumber = "(.text+0xa)" ...
			 * ... and columnNumber =  undefined reference to `Foo'↵collect2"
			 */
			if (lineNumber.includes(".text+0x")) {
				// it is a Linker Error
				errorMessage = columnNumber.trim().split("\n")[0];
				newErrorType = "linker-error";
				// returning a newErrorType key will indicate to dockerConfigController that ...
				// ... a new error type was detected while parsing and it will override the ...
				// ... default 'compilation-error' error type
				return {
					newErrorType,
					errorMessage,
					errorStack,
				};
			} else {
				console.error(
					"New error type detected while parsing in compilationErrorParser:",
					error
				);
				return { errorStack };
			}
		} else {
			return {
				errorMessage,
				lineNumber,
				columnNumber,
				errorStack,
			};
		}
	} catch (caughtError) {
		// check for any compilation terminations
		/*
		 * compilation termination sample:
		 * s-081e82ab6dc36db601.c:1:16: fatal error: stdio: No such file or directory
		 *	#include<stdio>
		 *        			^
		 *	compilation terminated.
		 *
		 */
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
		// TODO:
		// find an efficient way to detect Linker Errors
		// "undefined reference to..." can be one of them

		// check if it's a Linker Error as some Linker Errors cannot be ...
		// ... parsed as above and throws an error in the process
		if (error.includes("undefined reference to")) {
			// "undefined reference to" is one of the most common ...
			// ... Linker Errors
			try {
				errorMessage = error
					.substring(error.indexOf("undefined reference to"))
					.split("\n")[0];
			} catch (err) {
				console.error("Error while parsing errorMessage:", err);
				errorMessage = null;
			}
			// if it is a Linker Error, update errorType to say: linker-error
			return {
				newErrorType: "linker-error",
				errorMessage,
				errorStack: error,
			};
		}
		console.error(`error in compilationErrorParser.js:`, caughtError);
		return {
			errorInParser: caughtError,
		};
	}
};
