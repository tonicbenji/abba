const fs = require("fs");
const path = require("path");
const R = require("ramda");
const now = require("performance-now");
const program = require("commander");
const dateFormat = require("dateformat");
const shuffleSeed = require("shuffle-seed");
const changeCase = require('change-case')

// Modules ----------

const settings = require("./gen-config");
const dataPaths = require("./data-paths");
const contexts = require("./contexts");
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
            contexts.general({ name: data, pageType }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.home({ home: data })
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
            contexts.general({ name: data, pageType }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.about({ about: data })
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
            contexts.general({ name: data, pageType }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.contact({ contact: data })
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
            contexts.general({ name: data, pageType }),
            contexts.buySell({ buySell }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data })
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
            contexts.general({ name: data, pageType }),
            contexts.buySell({ buySell }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.state({ state: data })
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
                contexts.general({ name: stateRegion, pageType }),
                contexts.buySell({ buySell }),
                contexts.industry({ industry: dataPaths.industry.data }),
                contexts.country({ country: dataPaths.country.data }),
                contexts.stateRegion({ stateRegion })
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
            contexts.general({ name: data, pageType }),
            contexts.buySell({ buySell }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.state({ state: dataPaths.state.data }),
            contexts.city({ city: data }),
        ]);

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = replaceTokens(context, templateFile);

        const path = [
            settings.outputLocation,
            `${context.buySell}-${context.industry}`,
            data,
            "index.html"
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
                contexts.general({ name: data, pageType }),
                contexts.buySell({ buySell }),
                contexts.industry({ industry: dataPaths.industry.data }),
                contexts.country({ country: dataPaths.country.data }),
                contexts.state({ state: dataPaths.state.data }),
                contexts.city({ city: dataPaths.city.data }),
                contexts.cityRegion({ cityRegion: cityRegion })
            ]);

            const templateFile = U.fileToStr(template + context.buySellFilename);

            const output = replaceTokens(context, templateFile);

            const path = [
                settings.outputLocation,
                `${context.buySell}-${context.industry}`,
                U.filenameFormat(cityRegion)
            ]

            const outputPath = U.relPathList(path);
            const prettyPath = U.prettyPath(path);

            // Outputs
            fs.writeFileSync(outputPath, output);

            U.genLog(buySell, cityRegion, prettyPath);

            // Child generator
            if (buySell === "Buy") {
                gen(["suburbs"], context);
            }
        });
    })
};

const genSuburbs = (data, template, pageType, parentContext) => {
    console.log(parentContext);
    const data_ = `${data}regions/${U.filenameCase(parentContext.name)}.txt`
    console.log(data_);
    const suburbs = U.removeAllEmpty(U.fileToList(data_));
    suburbs.map(suburb =>
        dataPaths.buySell.data.map(buySell => {
            const context = R.mergeAll([
                parentContext,
                contexts.buySell({ buySell }),
                contexts.suburb({ suburb })
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

const performanceTimerDuration = ((performanceTimerEnd - performanceTimerStart) / 1000).toFixed(3);

U.performanceLog(performanceTimerDuration);
