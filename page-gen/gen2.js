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
    buySell: {
        data: ["Buy", "Sell"]
    },
    industry: {
        data: "childcare"
    },
    country: {
        data: "Australia"
    },
    state: {
        data: "NSW",
        template: "src/templates/nsw/"
    },
    suburbs: {
        data: "src/suburbs/demo-suburbs.txt",
        template: "demo-template.html"
    }
};

// Context Tokens ----------

const generalContext = ({ name }) => {
    return {
        name: name.toLowerCase(),
        Name: U.titleCase(name),
        NAME: name.toUpperCase(),
        nameNoThe: U.noThe(name.toLowerCase()),
        NameNoThe: U.noThe(U.titleCase(name)),
        NAMENOTHE: U.noThe(name.toUpperCase()),
        filename: `${U.filenameCase(name)}.html`
    }
}

const buySellContext = ({ buySell }) => {
    return {
        buySell: buySell.toLowerCase(),
        BuySell: U.titleCase(buySell),
        BUYSELL: buySell.toUpperCase(),
        buySellFilename: `${U.filenameCase(buySell)}.html`
    };
};

const industryContext = ({ industry }) => {
    return {
        industry: industry.toLowerCase(),
        Industry: U.titleCase(industry),
        INDUSTRY: industry.toUpperCase(),
    };
};

const countryContext = ({ country }) => {
    return {
        country: country.toLowerCase(),
        Country: U.titleCase(country),
        COUNTRY: country.toUpperCase(),
    }
}

const stateContext = ({ state }) => {
    return {
        state: state.toLowerCase(),
        State: U.titleCase(state),
        STATE: state.toUpperCase(),
    }
}

const suburbContext = ({ suburb }) => {
    return {
        suburb: suburb.toLowerCase(),
        Suburb: U.titleCase(suburb),
        SUBURB: suburb.toUpperCase(),
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

const gen = pageTypes => {
    pageTypes.map(pageType => {
        switch (pageType) {
            case "state":
                genState(pageType);
                break;
            case "suburbs":
                genSuburbs(pageType);
                break;
            default:
                U.error("No valid pageTypes specified in config");
        }
    });
}

const genState = (pageType) => {
        dataPaths.buySell.data.map(buySell => {
            const state = dataPaths.state.data;

            const context = R.mergeAll([
                generalContext({ name: state }),
                buySellContext({ buySell }),
                industryContext({ industry: dataPaths.industry.data }),
                countryContext({ country: dataPaths.country.data }),
                stateContext({ state })
            ]);

            const template = U.fileToStr(dataPaths.state.template + context.buySellFilename)

            const output = replaceTokens(context, template);

            const outputPath = U.relPathList([
                settings.outputLocation,
                `${context.buySell}-${context.industry}`,
                context.filename
            ]);

            // Outputs
            fs.writeFileSync(outputPath, output);

            U.genLog(state);
        })
}

const genSuburbs = (pageType) => {
    const data = U.removeAllEmpty(U.fileToList(dataPaths.suburbs.data));
    const template = U.fileToStr(dataPaths.suburbs.template);
    data.map(suburb =>
        dataPaths.buySell.data.map(buySell => {

            const context = R.mergeAll([
                generalContext({ name: suburb }),
                buySellContext({ buySell }),
                industryContext({ industry: dataPaths.industry.data }),
                countryContext({ country: dataPaths.country.data }),
                stateContext({ state: dataPaths.state.data }),
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
}

gen(settings.pageTypes);
