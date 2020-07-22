const mocha = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");

const server = require("../server.js");

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

console.log = msg => {};

module.exports = {
	server,
	mocha,
	chai,
	should,
	expect,
};
