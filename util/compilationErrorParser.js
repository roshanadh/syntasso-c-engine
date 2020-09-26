const checkForLinkerError = (stderr, socketId) => {
	// check if there is an instance of Linker Error within stderr
	try {
		let linkerErrorRegex = new RegExp(
			`(${socketId}.c:\\(.text\\+0x.+\\): )`
		);
		matchedString = stderr.match(linkerErrorRegex);
		if (matchedString) {
			// then such a Linker Error exists in stderr
			let header = matchedString[0];
			let index = matchedString.index;
			// header = "s-02c34e5658faf8e781.c:(.text+0xa): "
			let errorMessage = stderr
				.substring(index + header.length)
				.split("\n")[0];
			return errorMessage;
		}
		return null;
	} catch (err) {
		console.error(`error in checkForLinkerError:`, err);
		throw new Error(err);
	}
};
module.exports = (stderr, socketId) => {
	/*
	 * Parse the stderr string object to extract;
	 * lineNumber, columnNumber, errorMessage, errorStack, and errorType
	 *
	 * Note: Proceed with compilationErrorParser only if it has been detected ...
	 * ... that there's indeed an error in stderr, that is to prevent any unforeseen ...
	 * ... errors in this process
	 */
	try {
		let lineNumber = null,
			columnNumber = null,
			errorStack = stderr,
			errorMessage = null,
			errorType = "compilation-error";
		/*
		 * In a simple error stack, as well as a combined error stack such as, ...
		 * ... the 'error' keyword may appear as:
		 * s-0ad12537ccabc9d4c3.c:10:12: error: division by zero [-Werror=div-by-zero]
		 *      div = n/0;\ +
		 *             ^ +
		 * compilation terminated due to -Wfatal-errors.
		 * cc1: some warnings being treated as errors,
		 *
		 */
		// search for substring "s-02c34e5658faf8e781.c:5:2: error"
		let substringRegex = new RegExp(`(${socketId}.c:\\d+:\\d+: error: )`);
		let matchedString = stderr.match(substringRegex);
		if (matchedString) {
			let header = matchedString[0];
			// header = "s-02c34e5658faf8e781.c:5:2: error: "
			let index = matchedString.index;
			lineNumber = header.split(":")[1];
			columnNumber = header.split(":")[2];

			let errorMessageFromLinkerError = checkForLinkerError(
				stderr,
				socketId
			);
			if (errorMessageFromLinkerError) {
				errorMessage = errorMessageFromLinkerError;
				errorType = "linker-error";
			} else {
				// use other error message as no Linker Error message exists in stderr
				errorMessage = stderr
					.substring(index + header.length)
					.split("\n")[0];
			}
			return {
				lineNumber,
				columnNumber,
				errorMessage,
				errorStack,
				errorType,
			};
		}
		// if no 'error' keyword was found:
		// extract lineNumber and columnNumber by first ...
		// searching for substring "s-02c34e5658faf8e781.c:5:2: "
		substringRegex = new RegExp(`(${socketId}.c:\\d+:\\d+: )`);
		matchedString = stderr.match(substringRegex);
		if (matchedString) {
			let header = matchedString[0];
			// header = "s-02c34e5658faf8e781.c:5:2:"
			let index = matchedString.index;
			lineNumber = header.split(":")[1];
			columnNumber = header.split(":")[2];
			/*
			 * In a combined error stack, with warnings and Linker Errors, ...
			 * a Linker Error message makes more sense to why compilation terminated ...
			 * than a compilation warning message, so extract error message from within ...
			 * a Linker Error, if it exists
			 *
			 * Sample combined error stack:
			 * s-02c34e5658faf8e781.c: In function 'main':
			 * s-02c34e5658faf8e781.c:5:2: warning: implicit declaration of function 'Foo' [-Wimplicit-function-declaration]
			 *   Foo();
			 *   ^~~
			 * /tmp/cciiFJPL.o: In function 'main':
			 * s-02c34e5658faf8e781.c:(.text+0xa): undefined reference to 'Foo'
			 * collect2: error: ld returned 1 exit status
			 */
			let errorMessageFromLinkerError = checkForLinkerError(
				stderr,
				socketId
			);
			if (errorMessageFromLinkerError) {
				errorMessage = errorMessageFromLinkerError;
				errorType = "linker-error";
			} else {
				// use other error message as no Linker Error message exists in stderr
				errorMessage = stderr
					.substring(index + header.length)
					.split("\n")[0];
			}
		} else {
			// there may not be a lineNumber or columnNumber in the stderr ...
			// ... incase of some Linker Errors, so search for Linker Error
			let errorMessageFromLinkerError = checkForLinkerError(
				stderr,
				socketId
			);
			if (errorMessageFromLinkerError) {
				errorMessage = errorMessageFromLinkerError;
				errorType = "linker-error";
			}
		}
		return {
			lineNumber,
			columnNumber,
			errorMessage,
			errorStack,
			errorType,
		};
	} catch (err) {
		return {
			errorInParser: err,
		};
	}
};
