const fs = require("fs");
const path = require("path");
const R = require("ramda");
const now = require("performance-now");
const program = require("commander");
const dateFormat = require("dateformat");
const shuffleSeed = require("shuffle-seed");

// Personal modules ----------

const settings = require("./gen-config");
const U = require("./utilities");

// Guide ----------

// This website generator maps over lists of data to generate pages using different templates and data. It uses the Ramda library to process data.
// The generator first maps over a list of page types. For each page type, it calls a function that will generate the pages for that type of page. This second function will map over its own data, merging it with general data. It may also call even more specific map functions if it needs to, in order to generate pages that depend on data from their parent.
// The maps output only side effects. They don't build up values due to performance considerations.
// Map structure:
// 1. Map pageTypes
// 1.1. Map pages
// (And some maps occur twice - over buy then sell)

// TODO: make the subset feature use list truncation based on a fraction instead of the global counter method

// Paths to data, as well as some data provided directly ----------

const dataPaths = {
    country: "Australia",
    industry: "childcare",
    buySell: ["Buy", "Sell"],
    suburbs: {
        data: "src/suburbs/demo-suburbs.txt",
        template: "demo-template.html"
    }
};

// Context Tokens ----------

const buySellContext = ({ buySell }) => {
    return {
        buySell: buySell.toLowerCase(),
        BuySell: U.titleCase(buySell),
        BUYSELL: buySell.toUpperCase()
    };
};

const industryContext = ({ industry }) => {
    return {
        industry: industry.toLowerCase(),
        Industry: U.titleCase(industry),
        INDUSTRY: industry.toUpperCase()
    };
};

const suburbContext = ({ suburb }) => {
    return {
        suburb: suburb.toLowerCase(),
        Suburb: U.titleCase(suburb),
        SUBURB: suburb.toUpperCase(),
        filename: `${U.filenameCase(suburb)}.html`
    };
};

const replaceTokens = (data, template) => {
    let OUTPUT = template;
    R.mapObjIndexed((num, key, obj) => {
        OUTPUT = U.replaceToken(key, data[key])(OUTPUT);
    }, data);
    return OUTPUT;
};

// Generators ----------

const gen = pageTypes =>
    pageTypes.map(pageType => {
        const { template, data } = dataPaths[pageType];
        const template_ = U.fileToStr(template);
        const data_ = U.removeAllEmpty(U.fileToList(data));
        switch (pageType) {
            case "suburbs":
                genSuburbs(template_, data_);
                break;
            default:
                U.error("No valid pageTypes specified in config");
        }
    });

const genSuburbs = (template, data) =>
    data.map(suburb =>
        dataPaths.buySell.map(buySell => {
            // Build token replace object
            const context = R.mergeAll([
                buySellContext({ buySell }),
                industryContext({ industry: dataPaths.industry }),
                suburbContext({ suburb })
            ]);

            const output = replaceTokens(context, template);

            const outputPath = U.relPathList([
                settings.outputLocation,
                `${context.buySell}-${context.industry}`,
                context.filename
            ]);

            // Outputs
            fs.writeFileSync(outputPath, output);

            U.genLog(suburb);
        })
    );

gen(settings.pageTypes);
