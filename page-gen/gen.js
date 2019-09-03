const now = require("performance-now");
const dataPaths = require("./data-paths");
const generators = require("./generators");
const U = require("./utilities");
const settings = require("./gen-config");

const performanceTimerStart = now();

U.sitemapStream.write(dataPaths.sitemap.data.header);

generators.run({ pageTypes: dataPaths.firstLevelPageTypes });

U.sitemapStream.write(dataPaths.sitemap.data.footer);

const performanceTimerEnd = now();

const performanceTimerDuration = (
    (performanceTimerEnd - performanceTimerStart) /
    1000
).toFixed(3);

U.performanceLog(performanceTimerDuration);
