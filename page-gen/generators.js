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
    const context = {
        ...R.mergeAll([
            contexts.general({ name: data, pageType, footerType: "page" }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.home()
        ]),
        get path() {
            return [settings.outputLocation, context.filename];
        },
        get prettyPath() {
            return U.prettyPath(this.path);
        },
        get outputPath() {
            return U.relPathList(this.path);
        },
        get domainPath() {
            return settings.domain + context.prettyPath;
        },
        get schema() {
            return U.schema([[this.home, ""]]);
        }
    };
    console.log(context);

    const templateFile = U.fileToStr(template);

    const output = U.replaceTokens(context, templateFile);

    // Outputs
    fs.writeFileSync(context.outputPath, output);
    U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
    U.directoryStream.write(U.directoryItem(context.prettyPath, context.name));
    U.genLog("Single", data, context.prettyPath);
};

const about = (data, template, pageType) => {
    const context = {
        ...R.mergeAll([
            contexts.general({ name: data, pageType, footerType: "page" }),
            contexts.home(),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.about({ about: data })
        ]),
        get path() {
            return [settings.outputLocation, context.filename];
        },
        get prettyPath() {
            return U.prettyPath(this.path);
        },
        get outputPath() {
            return U.relPathList(this.path);
        },
        get domainPath() {
            return settings.domain + context.prettyPath;
        },
        get schema() {
            return U.schema([[this.home, ""], [this.title, this.filename]]);
        }
    };

    const templateFile = U.fileToStr(template);

    const output = U.replaceTokens(context, templateFile);

    // Outputs
    fs.writeFileSync(context.outputPath, output);
    U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
    U.directoryStream.write(U.directoryItem(context.prettyPath, context.name));
    U.genLog("Single", data, context.prettyPath);
};

const contact = (data, template, pageType) => {
    const context = {
        ...R.mergeAll([
            contexts.general({ name: data, pageType, footerType: "page" }),
            contexts.home(),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.contact({ contact: data })
        ]),
        get path() {
            return [settings.outputLocation, context.filename];
        },
        get prettyPath() {
            return U.prettyPath(this.path);
        },
        get outputPath() {
            return U.relPathList(this.path);
        },
        get domainPath() {
            return settings.domain + context.prettyPath;
        },
        get schema() {
            return U.schema([[this.home, ""], [this.title, this.prettyPath]]);
        }
    };

    const templateFile = U.fileToStr(template);

    const output = U.replaceTokens(context, templateFile);

    // Outputs
    fs.writeFileSync(context.outputPath, output);
    U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
    U.directoryStream.write(U.directoryItem(context.prettyPath, context.name));
    U.genLog("Single", data, context.prettyPath);
};

const country = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = {
            ...R.mergeAll([
                contexts.general({ name: data, pageType, footerType: "country" }),
                contexts.home(),
                contexts.buySell({ buySell }),
                contexts.industry({ industry: dataPaths.industry.data }),
                contexts.country({ country: dataPaths.country.data })
            ]),
            get path() {
                return [
                    settings.outputLocation,
                    `${this.buySell}-${this.industry}`,
                    this.filename
                ];
            },
            get prettyPath() {
                return U.prettyPath(this.path);
            },
            get outputPath() {
                return U.relPathList(this.path);
            },
            get domainPath() {
                return settings.domain + context.prettyPath;
            },
            get pageTitle() {
                return `${this.Trade} ${this.Industry} in ${this.Name}`;
            },
            get schema() {
                return U.schema([[this.home, ""], [this.pageTitle, this.path]]);
            }
        };

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = U.replaceTokens(context, templateFile);

        // Outputs
        fs.writeFileSync(context.outputPath, output);
        U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
        U.directoryStream.write(U.directoryItem(context.prettyPath, context.name));
        U.genLog(buySell, data, context.prettyPath);
    });
};

const state = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = {
            ...R.mergeAll([
                contexts.general({ name: data, pageType, footerType: "state" }),
                contexts.buySell({ buySell }),
                contexts.industry({ industry: dataPaths.industry.data }),
                contexts.country({ country: dataPaths.country.data }),
                contexts.state({ state: data })
            ]),
            get path() {
                return [
                    settings.outputLocation,
                    `${this.buySell}-${this.industry}`,
                    this.filename
                ];
            },
            get prettyPath() {
                return U.prettyPath(this.path);
            },
            get outputPath() {
                return U.relPathList(this.path);
            },
            get domainPath() {
                return settings.domain + context.prettyPath;
            },
            get schema() {
                return U.schema([[this.home, ""], [this.pageTitle, this.path]]);
            }
        };

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = U.replaceTokens(context, templateFile);

        // Outputs
        fs.writeFileSync(context.outputPath, output);
        U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
        U.directoryStream.write(U.directoryItem(context.prettyPath, context.name));
        U.genLog(buySell, data, context.prettyPath);
    });
};

const stateRegions = (data, template, pageType) => {
    const stateRegions = U.removeAllEmpty(U.fileToList(data));
    stateRegions.map(stateRegion => {
        dataPaths.buySell.data.map(buySell => {
            const context = {
                ...R.mergeAll([
                    contexts.general({ name: stateRegion, pageType, footerType: "stateRegion" }),
                    contexts.buySell({ buySell }),
                    contexts.industry({ industry: dataPaths.industry.data }),
                    contexts.country({ country: dataPaths.country.data }),
                    contexts.stateRegion({ stateRegion })
                ]),
                get path() {
                    return [
                        settings.outputLocation,
                        `${this.buySell}-${this.industry}`,
                        this.filename
                    ];
                },
                get prettyPath() {
                    return U.prettyPath(this.path);
                },
                get outputPath() {
                    return U.relPathList(this.path);
                },
                get domainPath() {
                    return settings.domain + context.prettyPath;
                },
                get schema() {
                    return U.schema([[this.home, ""], [this.pageTitle, this.path]]);
                }
            }

            const templateFile = U.fileToStr(
                template + context.buySellFilename
            );

            const output = U.replaceTokens(context, templateFile);

            // Outputs
            fs.writeFileSync(context.outputPath, output);
            U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
            U.directoryStream.write(U.directoryItem(context.prettyPath, context.name));
            U.genLog(buySell, stateRegion, context.prettyPath);
        });
    });
};

const city = (data, template, pageType) => {
    dataPaths.buySell.data.map(buySell => {
        const context = {
            ...R.mergeAll([
                contexts.general({ name: data, pageType, footerType: "city" }),
                contexts.buySell({ buySell }),
                contexts.industry({ industry: dataPaths.industry.data }),
                contexts.country({ country: dataPaths.country.data }),
                contexts.state({ state: dataPaths.state.data }),
                contexts.city({ city: data })
            ]),
            get path() {
                return [
                    settings.outputLocation,
                    `${this.buySell}-${this.industry}`,
                    data,
                    "index.html"
                ];
            },
            get prettyPath() {
                return U.prettyPath(this.path);
            },
            get outputPath() {
                return U.relPathList(this.path);
            },
            get domainPath() {
                return settings.domain + context.prettyPath;
            }
        };

        const templateFile = U.fileToStr(template + context.buySellFilename);

        const output = U.replaceTokens(context, templateFile);

        // Outputs
        fs.writeFileSync(context.outputPath, output);
        U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
        U.directoryStream.write(U.directoryItem(context.prettyPath, context.name));
        U.genLog(buySell, data, context.prettyPath);
    });
};

const cityRegions = (data, template, pageType) => {
    const cityRegions = U.removeAllEmpty(U.fileToList(data));
    cityRegions.map(cityRegion => {
        dataPaths.buySell.data.map(buySell => {
            const context = {
                ...R.mergeAll([
                    contexts.general({ name: data, pageType, footerType: "city" }),
                    contexts.buySell({ buySell }),
                    contexts.industry({ industry: dataPaths.industry.data }),
                    contexts.country({ country: dataPaths.country.data }),
                    contexts.state({ state: dataPaths.state.data }),
                    contexts.city({ city: dataPaths.city.data }),
                    contexts.cityRegion({ cityRegion: cityRegion })
                ]),
                get path() {
                    return [
                        settings.outputLocation,
                        `${this.buySell}-${this.industry}`,
                        U.filenameFormat(cityRegion)
                    ];
                },
                get prettyPath() {
                    return U.prettyPath(this.path);
                },
                get outputPath() {
                    return U.relPathList(this.path);
                },
                get domainPath() {
                    return settings.domain + context.prettyPath;
                }
            };

            const templateFile = U.fileToStr(
                template + context.buySellFilename
            );

            const output = U.replaceTokens(context, templateFile);

            // Outputs
            fs.writeFileSync(context.outputPath, output);
            U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
            U.directoryStream.write(U.directoryItem(context.prettyPath, context.name));
            U.genLog(buySell, cityRegion, context.prettyPath);

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
            const context = {
                ...R.mergeAll([
                    parentContext,
                    contexts.general({ name: data, pageType, footerType: "suburb" }),
                    contexts.buySell({ buySell }),
                    contexts.suburb({ suburb })
                ]),
                get path() {
                    return [
                        settings.outputLocation,
                        `${this.buySell}-${this.industry}`,
                        this.filename
                    ];
                },
                get prettyPath() {
                    return U.prettyPath(this.path);
                },
                get outputPath() {
                    return U.relPathList(this.path);
                },
                get domainPath() {
                    return settings.domain + context.prettyPath;
                }
            }

            const templateFile = U.fileToStr(
                template + context.buySellFilename
            );

            const output = U.replaceTokens(context, templateFile);

            // Outputs
            fs.writeFileSync(context.outputPath, output);
            U.sitemapStream.write(U.sitemapItem(context.domainPath, U.universalDate));
            U.directoryStream.write(
                U.directoryItem(
                    context.prettyPath,
                    `${context.buySell} a ${
                        context.industry
                    } business in <strong>${context.name}</strong>`
                )
            );
            U.genLog(buySell, suburb, context.prettyPath);
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
