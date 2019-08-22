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
// 1.1. Home
// 1.2. Country
// 1.3. State
// 1.4. Map state regions
// 1.5. City page
// 1.6. Map suburbs
// (And some maps occur twice - over buy then sell)

// TODO: make the subset feature use list truncation based on a fraction instead of the global counter method

// Paths to data (as well as some brief data provided directly) ----------

const dataPaths = {
    buySell: {
        data: ["Buy", "Sell"]
    },
    industry: {
        data: "childcare"
    },
    home: {
        data: "Buy and Sell Childcare Businesses across Australia",
        template: "src/templates/pages/home.html"
    },
    about: {
        data: "About Us",
        template: "src/templates/pages/about.html"
    },
    contact: {
        data: "Contact Us",
        template: "src/templates/pages/contact.html"
    },
    country: {
        data: "Australia",
        template: "src/templates/australia/"
    },
    state: {
        data: "NSW",
        template: "src/templates/nsw/"
    },
    stateRegions: {
        data: "src/nswRegions/nswRegions.txt",
        template: "src/templates/nsw/"
    },
    city: {
        data: "Sydney",
        template: "src/templates/sydney/"
    },
    suburbs: {
        data: "src/suburbs/demo-suburbs.txt",
        template: "src/templates/suburb/"
    }
};

// Context Tokens ----------

// TODO: grep replace rename the following tokens:
// id => pageType
// businessName => BUSINESSNAME
// all nsw => state
// all australia => country
// all name => its respective token
// all sydney => city

const generalContext = ({ name, pageType }) => {
    return {
        businessName: settings.businessName.toLowerCase(),
        BusinessName: U.titleCase(settings.businessName),
        BUSINESSNAME: settings.businessName.toUpperCase(),
        name: name.toLowerCase(),
        Name: U.titleCase(name),
        NAME: name.toUpperCase(),
        nameNoThe: U.noThe(name.toLowerCase()),
        NameNoThe: U.noThe(U.titleCase(name)),
        NAMENOTHE: U.noThe(name.toUpperCase()),
        filename: `${U.filenameCase(name)}.html`,
        pageType: pageType
    };
};

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
        INDUSTRY: industry.toUpperCase()
    };
};

const homeContext = ({ home }) => {
    return {
        homeTitle: home
    };
}

const countryContext = ({ country }) => {
    return {
        country: country.toLowerCase(),
        Country: U.titleCase(country),
        COUNTRY: country.toUpperCase(),
        filename: "index.html"
    };
};

const stateContext = ({ state }) => {
    return {
        state: state.toLowerCase(),
        State: U.titleCase(state),
        STATE: state.toUpperCase()
    };
};

const stateRegionContext = ({ stateRegion }) =>
    stateContext({ state: stateRegion });

const cityContext = ({ city }) => {
    return {
        city: city.toLowerCase(),
        City: U.titleCase(city),
        CITY: city.toUpperCase(),
        filename: "index.js"
    };
};

const suburbContext = ({ suburb }) => {
    return {
        suburb: suburb.toLowerCase(),
        Suburb: U.titleCase(suburb),
        SUBURB: suburb.toUpperCase()
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
        const { data, template } = dataPaths[pageType];
        U.headerLog(pageType);
        switch (pageType) {
            case "home":
                genHome(data, template, pageType);
                break;
            case "country":
                genCountry(data, template, pageType);
                break;
            case "state":
                genState(data, template, pageType);
                break;
            case "stateRegions":
                genStateRegions(data, template, pageType);
                break;
            case "city":
                genCity(data, template, pageType);
                break;
            case "suburbs":
                genSuburbs(data, template, pageType);
                break;
            default:
                U.error("No valid pageTypes specified in config");
        }
    });
};

const genHome = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = R.mergeAll([
            generalContext({ name: data, pageType }),
            buySellContext({ buySell }),
            industryContext({ industry: dataPaths.industry.data }),
            countryContext({ country: dataPaths.country.data }),
            stateContext({ state: data })
        ]);

        const templateFile = U.fileToStr(template);

        const output = replaceTokens(context, templateFile);

        const path = [
            settings.outputLocation,
            context.filename
        ]

        const outputPath = U.relPathList(path);
        const prettyPath = U.prettyPath(path);

        // Outputs
        fs.writeFileSync(outputPath, output);

        U.genLog(buySell, data, prettyPath);
    });
};

const genCountry = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = R.mergeAll([
            generalContext({ name: data, pageType }),
            buySellContext({ buySell }),
            industryContext({ industry: dataPaths.industry.data }),
            countryContext({ country: dataPaths.country.data })
        ]);

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = replaceTokens(context, templateFile);

        const path = [
            settings.outputLocation,
            `${context.buySell}-${context.industry}`,
            context.filename
        ]

        const outputPath = U.relPathList(path);
        const prettyPath = U.prettyPath(path);

        // Outputs
        fs.writeFileSync(outputPath, output);

        U.genLog(buySell, data, prettyPath);
    });
};

const genState = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = R.mergeAll([
            generalContext({ name: data, pageType }),
            buySellContext({ buySell }),
            industryContext({ industry: dataPaths.industry.data }),
            countryContext({ country: dataPaths.country.data }),
            stateContext({ state: data })
        ]);

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = replaceTokens(context, templateFile);

        const path = [
            settings.outputLocation,
            `${context.buySell}-${context.industry}`,
            context.filename
        ]

        const outputPath = U.relPathList(path);
        const prettyPath = U.prettyPath(path);

        // Outputs
        fs.writeFileSync(outputPath, output);

        U.genLog(buySell, data, prettyPath);
    });
};

const genStateRegions = (data, template, pageType) => {
    const stateRegions = U.removeAllEmpty(U.fileToList(data));
    stateRegions.map(stateRegion => {
        dataPaths.buySell.data.map(buySell => {
            const context = R.mergeAll([
                generalContext({ name: stateRegion, pageType }),
                buySellContext({ buySell }),
                industryContext({ industry: dataPaths.industry.data }),
                countryContext({ country: dataPaths.country.data }),
                stateRegionContext({ stateRegion })
            ]);

            const templateFile = U.fileToStr(
                template + context.buySellFilename
            );

            const output = replaceTokens(context, templateFile);

            const path = [
                settings.outputLocation,
                `${context.buySell}-${context.industry}`,
                context.filename
            ]

            const outputPath = U.relPathList(path);
            const prettyPath = U.prettyPath(path);

            // Outputs
            fs.writeFileSync(outputPath, output);

            U.genLog(buySell, stateRegion, prettyPath);
        });
    });
};

const genCity = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = R.mergeAll([
            generalContext({ name: data, pageType }),
            buySellContext({ buySell }),
            industryContext({ industry: dataPaths.industry.data }),
            countryContext({ country: dataPaths.country.data }),
            stateContext({ state: data }),
            cityContext({ city: data }),
        ]);

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = replaceTokens(context, templateFile);

        const path = [
            settings.outputLocation,
            `${context.buySell}-${context.industry}`,
            data,
            "index.js"
        ]

        const outputPath = U.relPathList(path);
        const prettyPath = U.prettyPath(path);

        // Outputs
        fs.writeFileSync(outputPath, output);

        U.genLog(buySell, data, prettyPath);
    });
};

const genSuburbs = (data, template, pageType) => {
    const suburbs = U.removeAllEmpty(U.fileToList(data));
    suburbs.map(suburb =>
        dataPaths.buySell.data.map(buySell => {
            const context = R.mergeAll([
                generalContext({ name: suburb, pageType }),
                buySellContext({ buySell }),
                industryContext({ industry: dataPaths.industry.data }),
                countryContext({ country: dataPaths.country.data }),
                stateContext({ state: dataPaths.state.data }),
                suburbContext({ suburb })
            ]);

            const templateFile = U.fileToStr(
                template + context.buySellFilename
            );

            const output = replaceTokens(context, templateFile);

            const path = [
                settings.outputLocation,
                `${context.buySell}-${context.industry}`,
                context.filename
            ]

            const outputPath = U.relPathList(path);
            const prettyPath = U.prettyPath(path);

            // Outputs
            fs.writeFileSync(outputPath, output);

            U.genLog(buySell, suburb, prettyPath);
        })
    );
};

// Run ----------

const performanceTimerStart = now();

gen(settings.pageTypes);

const performanceTimerEnd = now();

const performanceTimerDuration = ((performanceTimerStart - performanceTimerEnd) / 1000).toFixed(3);

U.performanceLog(performanceTimerDuration);
