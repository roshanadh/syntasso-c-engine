const logger = require("../util/logger.js");

module.exports = (stderr, socketId) => {
	// return the error substring and warnings substring from a combined stack
	/*
	 * Filter warnings and error from a combined warning + error stack such as:
	 * 	s-6e8b4c6b70bbb4f18b.c:1:23: warning: extra tokens at end of #include directive
	 *  #include<stdio.h>int main() {}
	 *                        ^~~~
	 * s-6e8b4c6b70bbb4f18b.c:1:32: fatal error: stdio.h>in: No such file or directory
	 *  #include<stdio.h>int main() {}
	 *                                 ^
	 * compilation terminated.
	 */
	try {
		let warningsSubstring = null,
			errorSubstring = null;
		// check for any "warning" token, if not found, whole stack is an error stack
		const warningRegex = new RegExp(
			`(${socketId}.c:\\d+:\\d+: warning: )`,
			"g"
		);
		if (!stderr.match(warningRegex)) {
			return {
				warningsSubstring,
				errorSubstring: stderr,
			};
		}
		const tokens = stderr.split(`${socketId}.c:`);
		// returns an array after splitting
		// filter tokens array to remove any empty elements
		const nonEmptyTokens = tokens.filter(element => element);
		for (let i = 0; i < nonEmptyTokens.length; i++) {
			let token = nonEmptyTokens[i];
			if (token.includes("fatal error") || token.includes("error")) {
				errorSubstring = `${socketId}.c:${token}`;
				break;
			}
		}
		warningsSubstring = stderr.replace(errorSubstring, "");
		return {
			warningsSubstring,
			errorSubstring,
		};
	} catch (error) {
		logger.error("Error in splitWarningsFromError:", error);
		return {
			errorInParser: error,
		};
	}
};
