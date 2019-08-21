const fs = require("fs");
const path = require("path");
const R = require("ramda");

const readFile = fileLoc => fs.readFileSync(path.resolve(__dirname, fileLoc))

const fileToStr = fileLoc => R.toString(readFile(fileLoc));

module.exports = { readFile, fileToStr }
