const now = require("performance-now");
const dataPaths = require("./data-paths");
const generators = require("./generators");
const U = require("./utilities");
const settings = require("./gen-config");

// Guide ----------

// This website generator maps over lists of data to generate pages using different templates and data. It uses the Ramda library to process data.
// The generator maps over a list of page types. For each page type, it calls a function that will map over the pages within that type. Hence there are two essential levels of mapping, but more levels can be added. If you need a page to use data from a parent page, then you will need to nest map functions. See the cityRegion => suburb generator for an example of this.
// However, the main way that data is passed to pages is by merging a series of object maker functions. These object makers accept data that they use to add context to their data. Then the merging causes object makers later in the sequence to be able to override the data of object makers higher up.
// The maps output only side effects. They chuck out the list that they are mapping over rather than modifying it due to performance considerations.
// Map structure:
// 1. Map pageTypes
// 1.1. Home
// 1.2. About
// 1.3. Contact
// 1.4. Country
// 1.5. State
// 1.6. Map state regions
// 1.7. City page
// 1.8. Map city regions
// 1.8.1. Map suburbs
// (And some maps occur twice - over buy then sell)

// TODO: make the subset feature use list truncation based on a fraction instead of the global counter method

// Context Tokens ----------

// TODO: grep replace rename the following tokens:
// id => pageType
// businessName => BUSINESSNAME
// all nsw => state
// all australia => country
// all name => its respective token
// all sydney => city
// title (new for home, about)
// all region => city region

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
