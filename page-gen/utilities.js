const fs = require("fs");
const path = require("path");
const R = require("ramda");
const chalk = require("chalk");

// Globals

let PAGE_COUNT = 0;

// Filesystem

const pathToList = p => p.split("/");

const relPath = p => path.join(__dirname, ...pathToList(p));

const relPathList = l => path.join(__dirname, ...l);

const readFile = p => fs.readFileSync(relPath(p));

const fileToStr = p => readFile(p).toString();

const fileToList = p => fileToStr(p).split("\n");

// Regex

const replaceToken = (a, b) => R.replace(new RegExp("{{" + a + "}}", "g"), b);

// String Manipulation

const titleCase = str => {
    return str.toLowerCase().replace(/^(.)|[\s-](.)/g, $1 => {
        return $1.toUpperCase();
    });
};

const snakeCase = s => s.replace(/\s/g, "-")

const filenameCase = s => R.pipe(
    R.toLower,
    snakeCase
)(s);

// Data Manipulation

const removeAllEmpty = ss => R.reject(R.isEmpty, ss);

// Logging

const error = s => console.log(chalk.red(s));

const genLog = s => console.log(chalk.yellow(`${PAGE_COUNT++}. `) + chalk.blue(s));

module.exports = {
    pathToList,
    relPath,
    readFile,
    fileToStr,
    fileToList,
    replaceToken,
    error,
    titleCase,
    genLog,
    removeAllEmpty,
    relPathList,
    snakeCase,
    filenameCase
};
