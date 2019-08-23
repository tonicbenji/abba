const fs = require("fs");
const path = require("path");
const R = require("ramda");
const chalk = require("chalk");
const changeCase = require('change-case')

// Globals

let PAGE_COUNT = 0;

// Filesystem

const pathToList = p => p.split("/");

const relPath = p => path.join(__dirname, ...pathToList(p));

const relPathList = l => path.join(__dirname, ...l);

const readFile = p => fs.readFileSync(relPath(p));

const fileToStr = p => readFile(p).toString();

const fileToList = p => fileToStr(p).split("\n");

const prettyPath = l => l.join("/");

// String Manipulation

const theToLower = s => s.replace(/the/i, "the")

const noThe = s => s.replace(/the/i, "")

const wrapInLinebreaks = s => `\n${s}\n`

const filenameCase = name => changeCase.paramCase(noThe(name))

const filenameFormat = name => `${filenameCase(name)}.html`

const replaceToken = (a, b) => R.replace(new RegExp("{{" + a + "}}", "g"), b);

const replaceTokens = (data, template) => {
    let OUTPUT = template;
    R.mapObjIndexed((num, key, obj) => {
        OUTPUT = replaceToken(key, data[key])(OUTPUT);
    }, data);
    return OUTPUT;
};

// Data Manipulation

const removeAllEmpty = ss => R.reject(R.isEmpty, ss);

// Logging

const error = s => console.log(chalk.red(s));

const genLog = (action, name, path) => {
    const actionColour = R.cond([
        // Needed to be written in point-free style for some reason due to Ramda library
        [R.equals("Buy"), chalk.green],
        [R.equals("Sell"), chalk.blue],
        [R.equals("Single"), chalk.cyan],
        [R.equals("Skipped"), chalk.red]
    ])
    console.log(chalk.yellow(`${PAGE_COUNT++}. `) + `${actionColour(action)} ${name} ${chalk.gray(path)}`);
}

const headerLogDelim = chalk.yellow('='.repeat(5));

const headerLog = s => console.log(wrapInLinebreaks(`${headerLogDelim} ${chalk.magenta(s.toUpperCase())} ${headerLogDelim}`));

const performanceLog = time => console.log(wrapInLinebreaks(chalk.grey(`Completed in ${chalk.yellow(time)} seconds.`)))

module.exports = {
    pathToList,
    relPath,
    readFile,
    fileToStr,
    fileToList,
    replaceToken,
    error,
    genLog,
    removeAllEmpty,
    relPathList,
    theToLower,
    noThe,
    headerLog,
    prettyPath,
    performanceLog,
    filenameCase,
    filenameFormat,
    replaceTokens
};
