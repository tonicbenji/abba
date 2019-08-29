const fs = require("fs");
const R = require("ramda");
const dateFormat = require("dateformat");
const changeCase = require("change-case");
const dataPaths = require("./data-paths");
const contexts = require("./contexts");
const U = require("./utilities");
const settings = require("./gen-config");

const run = (pageTypes, context) => {
    pageTypes.map(pageType => {
        const { data, template } = dataPaths[changeCase.camelCase(pageType)];
        U.headerLog(changeCase.titleCase(pageType));
        switch (pageType) {
            case "home":
                home(data, template, pageType);
                break;
            case "about":
                about(data, template, pageType);
                break;
            case "contact":
                contact(data, template, pageType);
                break;
            case "country":
                country(data, template, pageType);
                break;
            case "state":
                state(data, template, pageType);
                break;
            case "state regions":
                stateRegions(data, template, pageType);
                break;
            case "city":
                city(data, template, pageType);
                break;
            case "city regions":
                cityRegions(data, template, pageType);
                break;
            case "suburbs":
                suburbs(data, template, pageType, context);
                break;
            default:
                U.error("No valid pageTypes specified in config");
        }
    });
};

const home = (data, template, pageType) => {
    const context = R.mergeAll([
        contexts.general({ name: data, pageType }),
        contexts.industry({ industry: dataPaths.industry.data }),
        contexts.country({ country: dataPaths.country.data }),
        contexts.home({ home: data })
    ]);

    const templateFile = U.fileToStr(template);

    const output = U.replaceTokens(context, templateFile);

    const path = [settings.outputLocation, context.filename];

    const outputPath = U.relPathList(path);
    const prettyPath = U.prettyPath(path);
    const domainPath = settings.domain + prettyPath;

    // Outputs
    fs.writeFileSync(outputPath, output);
    U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
    U.directoryStream.write(U.directoryItem(prettyPath, context.name));
    U.genLog("Single", data, prettyPath);
};

const about = (data, template, pageType) => {
    const context = R.mergeAll([
        contexts.general({ name: data, pageType }),
        contexts.industry({ industry: dataPaths.industry.data }),
        contexts.country({ country: dataPaths.country.data }),
        contexts.about({ about: data })
    ]);

    const templateFile = U.fileToStr(template);

    const output = U.replaceTokens(context, templateFile);

    const path = [settings.outputLocation, context.filename];

    const outputPath = U.relPathList(path);
    const prettyPath = U.prettyPath(path);
    const domainPath = settings.domain + prettyPath;

    // Outputs
    fs.writeFileSync(outputPath, output);
    U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
    U.directoryStream.write(U.directoryItem(prettyPath, context.name));
    U.genLog("Single", data, prettyPath);
};

const contact = (data, template, pageType) => {
    const context = R.mergeAll([
        contexts.general({ name: data, pageType }),
        contexts.industry({ industry: dataPaths.industry.data }),
        contexts.country({ country: dataPaths.country.data }),
        contexts.contact({ contact: data })
    ]);

    const templateFile = U.fileToStr(template);

    const output = U.replaceTokens(context, templateFile);

    const path = [settings.outputLocation, context.filename];

    const outputPath = U.relPathList(path);
    const prettyPath = U.prettyPath(path);
    const domainPath = settings.domain + prettyPath;

    // Outputs
    fs.writeFileSync(outputPath, output);
    U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
    U.directoryStream.write(U.directoryItem(prettyPath, context.name));
    U.genLog("Single", data, prettyPath);
};

const country = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = R.mergeAll([
            contexts.general({ name: data, pageType }),
            contexts.buySell({ buySell }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data })
        ]);

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = U.replaceTokens(context, templateFile);

        const path = [
            settings.outputLocation,
            `${context.buySell}-${context.industry}`,
            context.filename
        ];

        const outputPath = U.relPathList(path);
        const prettyPath = U.prettyPath(path);
        const domainPath = settings.domain + prettyPath;

        // Outputs
        fs.writeFileSync(outputPath, output);
        U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
        U.directoryStream.write(U.directoryItem(prettyPath, context.name));
        U.genLog(buySell, data, prettyPath);
    });
};

const state = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = R.mergeAll([
            contexts.general({ name: data, pageType }),
            contexts.buySell({ buySell }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.state({ state: data })
        ]);

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = U.replaceTokens(context, templateFile);

        const path = [
            settings.outputLocation,
            `${context.buySell}-${context.industry}`,
            context.filename
        ];

        const outputPath = U.relPathList(path);
        const prettyPath = U.prettyPath(path);
        const domainPath = settings.domain + prettyPath;

        // Outputs
        fs.writeFileSync(outputPath, output);
        U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
        U.directoryStream.write(U.directoryItem(prettyPath, context.name));
        U.genLog(buySell, data, prettyPath);
    });
};

const stateRegions = (data, template, pageType) => {
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

            const output = U.replaceTokens(context, templateFile);

            const path = [
                settings.outputLocation,
                `${context.buySell}-${context.industry}`,
                context.filename
            ];

            const outputPath = U.relPathList(path);
            const prettyPath = U.prettyPath(path);
            const domainPath = settings.domain + prettyPath;

            // Outputs
            fs.writeFileSync(outputPath, output);
            U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
            U.directoryStream.write(U.directoryItem(prettyPath, context.name));
            U.genLog(buySell, stateRegion, prettyPath);
        });
    });
};

const city = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = R.mergeAll([
            contexts.general({ name: data, pageType }),
            contexts.buySell({ buySell }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.state({ state: dataPaths.state.data }),
            contexts.city({ city: data })
        ]);

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = U.replaceTokens(context, templateFile);

        const path = [
            settings.outputLocation,
            `${context.buySell}-${context.industry}`,
            data,
            "index.html"
        ];

        const outputPath = U.relPathList(path);
        const prettyPath = U.prettyPath(path);
        const domainPath = settings.domain + prettyPath;

        // Outputs
        fs.writeFileSync(outputPath, output);
        U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
        U.directoryStream.write(U.directoryItem(prettyPath, context.name));
        U.genLog(buySell, data, prettyPath);
    });
};

const cityRegions = (data, template, pageType) => {
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

            const templateFile = U.fileToStr(
                template + context.buySellFilename
            );

            const output = U.replaceTokens(context, templateFile);

            const path = [
                settings.outputLocation,
                `${context.buySell}-${context.industry}`,
                U.filenameFormat(cityRegion)
            ];

            const outputPath = U.relPathList(path);
            const prettyPath = U.prettyPath(path);
            const domainPath = settings.domain + prettyPath;

            // Outputs
            fs.writeFileSync(outputPath, output);
            U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
            U.directoryStream.write(U.directoryItem(prettyPath, context.name));
            U.genLog(buySell, cityRegion, prettyPath);

            // Child generator
            if (buySell === "Buy") {
                run(["suburbs"], context);
            }
        });
    });
};

const suburbs = (data, template, pageType, parentContext) => {
    const data_ = `${data}regions/${U.filenameCase(parentContext.name)}.txt`;
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

            const output = U.replaceTokens(context, templateFile);

            const path = [
                settings.outputLocation,
                `${context.buySell}-${context.industry}`,
                context.filename
            ];

            const outputPath = U.relPathList(path);
            const prettyPath = U.prettyPath(path);
            const domainPath = settings.domain + prettyPath;

            // Outputs
            fs.writeFileSync(outputPath, output);
            U.sitemapStream.write(U.sitemapItem(domainPath, U.universalDate));
            U.directoryStream.write(
                U.directoryItem(
                    prettyPath,
                    `${context.buySell} a ${context.industry} business in <strong>${context.name}</strong>`
                )
            );
            U.genLog(buySell, suburb, prettyPath);
        })
    );
};

module.exports = {
    run,
    home,
    about,
    contact,
    country,
    state,
    stateRegions,
    city,
    cityRegions,
    suburbs
};
