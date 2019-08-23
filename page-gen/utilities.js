const fs = require("fs");
const path = require("path");
const R = require("ramda");
const chalk = require("chalk");
const changeCase = require('change-case')
const dateFormat = require("dateformat");
const settings = require("./gen-config");

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

const tokenise = s => `{{${s}}}`;

const replaceTokens = (data, template) => {
    let OUTPUT = template;
    R.mapObjIndexed((num, key, obj) => {
        OUTPUT = R.replace(new RegExp(tokenise(key), "g"), data[key], OUTPUT)
    }, data);
    return OUTPUT;
};

const sitemapItem = (path, lastmod) => `
<url>
    <loc>${path}</loc>
    <lastmod>${lastmod}</lastmod>
</url>`;

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

// Streams

const sitemapStream = fs.createWriteStream(relPath(`${settings.outputLocation}/sitemap.xml`));

// Dates

const universalDate = dateFormat(new Date(), "yyyy-mm-dd");

module.exports = {
    pathToList,
    relPath,
    readFile,
    fileToStr,
    fileToList,
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
    replaceTokens,
    tokenise,
    sitemapItem,
    sitemapStream,
    universalDate
};
