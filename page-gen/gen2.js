const fs = require("fs");
const path = require("path");
const R = require("ramda");
const now = require("performance-now");
const program = require("commander");
const dateFormat = require("dateformat");
const shuffleSeed = require("shuffle-seed");
var changeCase = require('change-case')

// Personal modules ----------

const settings = require("./gen-config");
const U = require("./utilities");

// Guide ----------

// This website generator maps over lists of data to generate pages using different templates and data. It uses the Ramda library to process data.
// The generator maps over a list of page types. For each page type, it calls a function that will map over the pages within that type. Hence there are two essential levels of mapping, but more levels can be added. If you need a page to use data from a parent page, then you will need to nest map functions. See the cityRegion => suburb generator for an example of this.
// However, the main way that data is passed to pages is by merging a series of object maker functions. These object makers accept data that they use to add context to their data. Then the merging causes object makers later in the sequence to be able to override the data of object makers higher up.
// The maps output only side effects. They don't build up values due to performance considerations.
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

// Paths to data (as well as some brief data provided directly) ----------

const dataPaths = {
    firstLevelPageTypes: ["home", "about", "contact", "country", "state", "state regions", "city", "city regions"],
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
    cityRegions: {
        data: "src/regions/sydney.txt",
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
// title (new for home, about)
// all region => city region

const contextItem = (f, key, value) => {
    return {
        [f(key)]: f(value)
    }
}

const filenameFormat = name => `${changeCase.paramCase(name)}.html`

const contextMaker = (key, value) => {
    const key_ = !R.isEmpty(key) ? key : value;
    return {
        ...contextItem(R.toLower, key_, value),
        ...contextItem(R.toUpper, key_, value),
        ...contextItem(changeCase.camelCase, key_, value),
        ...contextItem(changeCase.constantCase, key_, value),
        filename: filenameFormat(value)
    }
}

const generalContext = ({ name }) => {
    return {
        ...contextMaker("", settings.businessName),
        ...contextMaker("", name),
        // nameNoThe: U.noThe(name.toLowerCase()),
        // NameNoThe: U.noThe(U.titleCase(name)),
        // NAMENOTHE: U.noThe(name.toUpperCase()),
    };
};

const buySellContext = ({ buySell }) => {
    return {
        ...contextMaker("buySell", buySell),
        buySellFilename: filenameFormat(buySell)
    };
};

const industryContext = ({ industry }) => contextMaker("industry", industry);

const homeContext = ({ home }) => {
    return {
        title: home,
        filename: "index.html"
    };
}

const aboutContext = ({ about }) => {
    return {
        title: about,
        filename: filenameFormat(about)
    };
}

const contactContext = ({ contact }) => {
    return {
        title: contact,
        filename: filenameFormat(contact)
    };
}


const countryContext = ({ country }) => {
    return {
        ...contextMaker("", country),
        filename: "index.html"
    };
};

const stateContext = ({ state }) => contextMaker("", state);

const stateRegionContext = ({ stateRegion }) => contextMaker("", stateRegion);

const cityContext = ({ city }) => {
    return {
        ...contextMaker("", city),
        filename: "index.html"
    };
};

const cityRegionContext = ({ cityRegion }) => contextMaker("", cityRegion);

const suburbContext = ({ suburb }) => contextMaker("", cityRegion);

const replaceTokens = (data, template) => {
    let OUTPUT = template;
    R.mapObjIndexed((num, key, obj) => {
        OUTPUT = U.replaceToken(key, data[key])(OUTPUT);
    }, data);
    return OUTPUT;
};

// Generators ----------

const gen = (pageTypes, context) => {
    pageTypes.map(pageType => {
        const { data, template } = dataPaths[changeCase.camelCase(pageType)];
        U.headerLog(changeCase.titleCase(pageType));
        switch (pageType) {
            case "home":
                genHome(data, template, pageType);
                break;
            case "about":
                genAbout(data, template, pageType);
                break;
            case "contact":
                genContact(data, template, pageType);
                break;
            case "country":
                genCountry(data, template, pageType);
                break;
            case "state":
                genState(data, template, pageType);
                break;
            case "state regions":
                genStateRegions(data, template, pageType);
                break;
            case "city":
                genCity(data, template, pageType);
                break;
            case "city regions":
                genCityRegions(data, template, pageType);
                break;
            case "suburbs":
                genSuburbs(data, template, pageType, context);
                break;
            default:
                U.error("No valid pageTypes specified in config");
        }
    });
};

const genHome = (data, template, pageType) => {
        const context = R.mergeAll([
            generalContext({ name: data, pageType }),
            industryContext({ industry: dataPaths.industry.data }),
            countryContext({ country: dataPaths.country.data }),
            homeContext({ home: data })
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

        U.genLog("Single", data, prettyPath);
};

const genAbout = (data, template, pageType) => {
        const context = R.mergeAll([
            generalContext({ name: data, pageType }),
            industryContext({ industry: dataPaths.industry.data }),
            countryContext({ country: dataPaths.country.data }),
            aboutContext({ about: data })
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

        U.genLog("Single", data, prettyPath);
};

const genContact = (data, template, pageType) => {
        const context = R.mergeAll([
            generalContext({ name: data, pageType }),
            industryContext({ industry: dataPaths.industry.data }),
            countryContext({ country: dataPaths.country.data }),
            contactContext({ contact: data })
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

        U.genLog("Single", data, prettyPath);
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
        console.log(context);

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
            stateContext({ state: dataPaths.state.data }),
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

const genCityRegions = (data, template, pageType) => {
    const cityRegions = U.removeAllEmpty(U.fileToList(data));
    cityRegions.map(cityRegion => {
        dataPaths.buySell.data.map(buySell => {
            const context = R.mergeAll([
                generalContext({ name: data, pageType }),
                buySellContext({ buySell }),
                industryContext({ industry: dataPaths.industry.data }),
                countryContext({ country: dataPaths.country.data }),
                stateContext({ state: dataPaths.state.data }),
                cityContext({ city: dataPaths.city.data }),
                cityRegionContext({ cityRegion: data })
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
        // Generate the suburbs for each region
        gen(["suburbs"], context);
    })
};

const genSuburbs = (data, template, pageType, parentContext) => {
    const suburbs = U.removeAllEmpty(U.fileToList(data));
    suburbs.map(suburb =>
        dataPaths.buySell.data.map(buySell => {
            const context = R.mergeAll([
                parentContext,
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

gen(dataPaths.firstLevelPageTypes);

const performanceTimerEnd = now();

const performanceTimerDuration = ((performanceTimerStart - performanceTimerEnd) / 1000).toFixed(3);

U.performanceLog(performanceTimerDuration);
