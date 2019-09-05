const fs = require("fs");
const R = require("ramda");
const dateFormat = require("dateformat");
const changeCase = require("change-case");
const dataPaths = require("./data-paths");
const contexts = require("./contexts");
const contexts2 = require("./contexts2");
const U = require("./utilities");
const settings = require("./gen-config");
const shuffleSeed = require("shuffle-seed");

// Note: importing isGenSuburbs didnt work, so I had to double-up all of the following
const program = require("commander");

program
    .option("-s, --suburbs", "Force generating the suburbs")
    .option("-ns, --no-suburbs", "Force not generating the suburbs");

program.parse(process.argv);

const isGenSuburbs = program.suburbs && settings.genSuburbs;

// Generators

const run = ({ pageTypes, context }) => {
    pageTypes.map(pageType => {
        const { data, template } = dataPaths[changeCase.camelCase(pageType)];
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
                isGenSuburbs &&
                    suburbs(
                        context.cityRegionSuburbs,
                        template,
                        pageType,
                        context
                    );
                break;
            case "directory":
                directory(data, template, pageType);
                break;
            default:
                U.warning("No valid pageTypes specified in config");
        }
    });
};

const home = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const context = R.pipe(
        contexts2.general,
        contexts2.industry,
        contexts2.country,
        contexts2.state,
        contexts2.home
    )(
        U.input({
            name: data,
            pageType,
            footerType: "home",
            industry: "Childcare",
            country: "Australia",
            state: "NSW"
        })
    );
    console.log(context.keywords);
    U.outputs({
        logAction: "Single",
        templatePath: template,
        data,
        isGenSuburbs,
        context
    });
};

const about = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const context = R.pipe(
        contexts2.general,
        contexts2.home,
        contexts2.industry,
        contexts2.country,
        contexts2.about
    )(
        U.input({
            name: data,
            pageType,
            footerType: "page",
            industry: "Childcare",
            country: "Australia",
            state: "NSW"
        })
    );
    U.outputs({
        logAction: "Single",
        templatePath: template,
        data,
        isGenSuburbs,
        context
    });
};

const contact = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const context = R.pipe(
        contexts2.general,
        contexts2.home,
        contexts2.industry,
        contexts2.country,
        contexts2.contact
    )(
        U.input({
            name: data,
            pageType,
            footerType: "page",
            industry: "Childcare",
            country: "Australia",
            state: "NSW"
        })
    );
    U.outputs({
        logAction: "Single",
        templatePath: template,
        data,
        isGenSuburbs,
        context
    });
};

const country = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    dataPaths.buySell.data.map(buySell => {
        const context = R.pipe(
            contexts2.general,
            contexts2.home,
            contexts2.buySell,
            contexts2.industry,
            contexts2.state,
            contexts2.country
        )(
            U.input({
                name: data,
                pageType,
                footerType: "country",
                industry: "Childcare",
                country: "Australia",
                state: "NSW",
                buySell
            })
        );
        U.outputs({
            logAction: buySell,
            templatePath: template + context.buySellFilename,
            data,
            isGenSuburbs,
            context
        });
    });
};

const state = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    dataPaths.buySell.data.map(buySell => {
        dataPaths.buySell.data.map(buySell => {
            const context = R.pipe(
                contexts2.general,
                contexts2.home,
                contexts2.buySell,
                contexts2.industry,
                contexts2.country,
                contexts2.state
            )(
                U.input({
                    name: data,
                    pageType,
                    footerType: "state",
                    industry: "Childcare",
                    country: "Australia",
                    state: "NSW",
                    buySell
                })
            );
            U.outputs({
                logAction: buySell,
                templatePath: template + context.buySellFilename,
                data,
                isGenSuburbs,
                context
            });
        });
    });
};

const stateRegions = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const stateRegions = U.removeAllEmpty(U.fileToList(data));
    stateRegions.map(stateRegion => {
        dataPaths.buySell.data.map(buySell => {
            const context = R.pipe(
                contexts2.general,
                contexts2.buySell,
                contexts2.industry,
                contexts2.country,
                contexts2.state,
                contexts2.stateRegion
            )(
                U.input({
                    name: stateRegion,
                    stateRegion,
                    pageType,
                    footerType: "stateRegion",
                    industry: "Childcare",
                    country: "Australia",
                    state: "NSW",
                    buySell
                })
            );
            U.outputs({
                logAction: buySell,
                templatePath: template + context.buySellFilename,
                data: stateRegion,
                isGenSuburbs,
                context
            });
        });
    });
};

const city = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    dataPaths.buySell.data.map(buySell => {
        const context = R.pipe(
            contexts2.general,
            contexts2.buySell,
            contexts2.industry,
            contexts2.country,
            contexts2.state,
            contexts2.city
        )(
            U.input({
                name: data,
                city: data,
                pageType,
                footerType: "city",
                industry: "Childcare",
                country: "Australia",
                state: "NSW",
                buySell
            })
        );
        U.outputs({
            logAction: buySell,
            templatePath: template + context.buySellFilename,
            data,
            isGenSuburbs,
            context
        });
    });
};

const cityRegions = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const cityRegions = U.removeAllEmpty(U.fileToList(data));
    cityRegions.map(cityRegion => {
        dataPaths.buySell.data.map(buySell => {
            const context = R.pipe(
                contexts2.general,
                contexts2.buySell,
                contexts2.industry,
                contexts2.country,
                contexts2.state,
                contexts2.city,
                contexts2.cityRegion
            )(
                U.input({
                    name: cityRegion,
                    city: "Sydney",
                    cityRegion,
                    pageType,
                    footerType: "city",
                    industry: "Childcare",
                    country: "Australia",
                    state: "NSW",
                    buySell
                })
            );
            U.outputs({
                logAction: buySell,
                templatePath: template + context.buySellFilename,
                data: cityRegion,
                isGenSuburbs,
                context
            });
            if (buySell === "Buy") {
                run({ pageTypes: ["suburbs"], context });
            }
        });
    });
};

const suburbs = (data, template, pageType, parentContext) => {
    U.headerLog(changeCase.titleCase(`${parentContext.name} ${pageType}`));
    data.map(suburb =>
        dataPaths.buySell.data.map(buySell => {
            const context = R.pipe(
                x => R.mergeDeepRight({ parentContext, ...parentContext }, x),
                contexts2.general,
                contexts2.buySell,
                contexts2.suburb
            )(
                U.input({
                    name: suburb,
                    suburb,
                    city: "Sydney",
                    cityRegion: "Sydney",
                    pageType,
                    footerType: "suburb",
                    industry: "Childcare",
                    country: "Australia",
                    state: "NSW",
                    buySell
                })
            );
            U.outputs({
                logAction: buySell,
                templatePath: template + context.buySellFilename,
                data: suburb,
                isGenSuburbs,
                context
            });
        })
    );
};

const directory = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const context = R.pipe(
        contexts2.general,
        contexts2.home,
        contexts2.industry,
        contexts2.country,
        contexts2.state,
        contexts2.city,
        contexts2.directory
    )(
        U.input({
            name: pageType,
            pageType,
            footerType: "page",
            industry: "Childcare",
            country: "Australia",
            state: "NSW",
            city: "Sydney",
            buySell: "Trade"
        })
    );
    U.outputs({
        logAction: "Single",
        templatePath: template,
        data: context.Name,
        isGenSuburbs,
        context
    });
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
