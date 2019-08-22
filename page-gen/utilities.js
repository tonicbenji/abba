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

const theToLower = s => s.replace(/the/i, "the")

const noThe = s => s.replace(/the/i, "")

const wrapInLinebreaks = s => `\n${s}\n`

// Data Manipulation

const removeAllEmpty = ss => R.reject(R.isEmpty, ss);

// Logging

const error = s => console.log(chalk.red(s));

const genLog = (buySell, name) => console.log(chalk.yellow(`${PAGE_COUNT++}. `) + `${chalk.blue(buySell)} ${name}`);

const headerLogDelim = chalk.yellow('='.repeat(5));

const headerLog = s => console.log(wrapInLinebreaks(`${headerLogDelim} ${chalk.magenta(s)} ${headerLogDelim}`));

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
    filenameCase,
    theToLower,
    noThe,
    headerLog
};
