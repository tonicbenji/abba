const now = require("performance-now");
const dataPaths = require("./data-paths");
const generators = require("./generators");
const U = require("./utilities");
const settings = require("./gen-config");
const program = require("commander");

program
    .option("-s, --suburbs", "Force generating the suburbs")
    .option("-ns, --no-suburbs", "Force not generating the suburbs");

program.parse(process.argv);

const isGenSuburbs = program.suburbs && settings.genSuburbs;

const performanceTimerStart = now();

isGenSuburbs && U.sitemapStream.write(dataPaths.sitemap.data.header);

generators.run({ pageTypes: dataPaths.firstLevelPageTypes });

isGenSuburbs && U.sitemapStream.write(dataPaths.sitemap.data.footer);

const performanceTimerEnd = now();

const performanceTimerDuration = (
    (performanceTimerEnd - performanceTimerStart) /
    1000
).toFixed(3);

U.performanceLog(performanceTimerDuration);
