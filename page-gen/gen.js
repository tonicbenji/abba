const now = require("performance-now");
const dataPaths = require("./data-paths");
const generators = require("./generators");
const U = require("./utilities");
const settings = require("./gen-config");

// Guide ----------

// This website generator maps over lists of data to generate pages using different templates and data. It uses the Lodash-like Ramda library to process data.
// The generator uses maps within maps (instead of loops) to generate all the pages. However, it tries to keep the nesting of maps as flat as possible. Firstly it maps over a list of page types, using a switcher to call a different generator function for each different pagetype. These generators each include their own maps to map over the pages within that pagetype. One generator - the city region generator - calls a nested generator. This is because each city region has its own suburbs that need to inherit data from their city region parent.
// The generators each collate a large object of data for each page. This data is is contextually specific to the page being generated. They then pass this object to a function that turns it into a series of regular expressions. These regexes are then applied to the particular template of this page type, and the output is the finished page.
// The data is called a 'context', and it is created by merging together multiple objects in a cascading manner in which one overrides the next. Hence these objects are arranged in order of general to specific. Each of these objects is an object maker function that can take parameters that tailor it to the individual page further. Additionally, several getter functions are then merged into the object, because these have the ability to manipulate data from the object itself.
// For performance reasons, these map functions output only side-effects, and they discard the list that they operate over. The generator's 'outputs' function combines all of the side-effects of these generators: the outputted page, writing to the sitemap, and the console log.
// Here is an overview of the hierarchy of mapping in this program:
// 1. Map pageTypes
// 1.1. Home
// 1.2. About
// 1.3. Contact
// 1.4. Country
// 1.4.1 Map Buy/Sell
// 1.5. State
// 1.5.1 Map Buy/Sell
// 1.6. Map state regions
// 1.6.1 Map Buy/Sell
// 1.7. City page
// 1.7.1 Map Buy/Sell
// 1.8. Map city regions
// 1.8.1 Map Buy/Sell
// 1.8.1.1 Map city region suburbs

// Run ----------

const performanceTimerStart = now();

U.sitemapStream.write(U.relPath(dataPaths.sitemap.data.header));

generators.run(dataPaths.firstLevelPageTypes);

U.sitemapStream.write(U.relPath(dataPaths.sitemap.data.footer));

const performanceTimerEnd = now();

const performanceTimerDuration = (
    (performanceTimerEnd - performanceTimerStart) /
    1000
).toFixed(3);

U.performanceLog(performanceTimerDuration);
