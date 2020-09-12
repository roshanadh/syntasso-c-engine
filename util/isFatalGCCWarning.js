const hasError = (stderr, socketId) => {
	// check if the supplied stderr has any instances of error

	// * check for "error" keyword in stderr; occurs in compilation errors
	const errorRegex = new RegExp(`(${socketId}.c:\\d+:\\d+: error: )`);
	if (stderr.search(errorRegex) !== -1) return true;

	// * check for "fatal error" keyword in stderr; occurs mainly in GCC warnings
	const fatalErrorRegex = new RegExp(
		`(${socketId}.c:\\d+:\\d+: fatal error: )`
	);
	if (stderr.search(fatalErrorRegex) !== -1) return true;

	// * check for Linker Errors
	/*
	 * Some Linker Errors may look like:
	 * s-bf060be7a5b6ff7a93.c:(.text+0xa): undefined reference to `Foo'
	 * collect2: error: ld returned 1 exit status
	 *
	 * So, look for ".text+0x" substring in stderr
	 */
	if (stderr.includes(".text+0x")) return true;

	// * check for compilation terminations
	if (stderr.includes("compilation terminated")) return true;

	return false;
};

module.exports = (stderr, socketId) => {
	// Checks whether the supplied stderr has any fatal GCC warnings
	/*
	 * sample Non-Fatal GCC warning:
	 * s-6353b6540a377d1610.c: In function 'main':
	 * s-6353b6540a377d1610.c:5:1: warning: implicit declaration of function 'foo' [-Wimplicit-function-declaration]
	 *  foo();
	 *  ^~~
	 *
	 * sample Fatal GCC Warning (Note the presence of 'error: ld returned 1 exit status'):
	 * s-ee6c8ccce6346b4029.c: In function 'main':
	 * s-ee6c8ccce6346b4029.c:4:1: warning: implicit declaration of function 'foo' [-Wimplicit-function-declaration]
	 *  foo();
	 *  ^~~
	 * /tmp/ccGdbOBN.o: In function `main':
	 * s-ee6c8ccce6346b4029.c:(.text+0x1b): undefined reference to `foo'
	 * collect2: error: ld returned 1 exit status
	 */
	// search for the substring sample: 's-6353b6540a377d1610.c:5:1: warning: '
	const warningRegex = new RegExp(`(${socketId}.c:\\d+:\\d+: warning: )`);
	const indexOfWarning = stderr.search(warningRegex);

	// stderr can have error if it has a fatal GCC warning or ...
	// ... if it has any other indication of errors

	// search for the substring sample: 'error: ld returned 1 exit status' ...
	// ... that is, check for fatal GCC Warning
	const exitStatusRegex = /(error: ld returned \d exit status)/;
	const indexOfExitStatus = stderr.search(exitStatusRegex);

	let isWarning = indexOfWarning !== -1 ? true : false;
	let isFatalWarning =
		hasError(stderr, socketId) && indexOfExitStatus !== -1 ? true : false;

	return {
		isWarning,
		isFatalWarning,
	};
};
