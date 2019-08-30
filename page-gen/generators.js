const fs = require("fs");
const R = require("ramda");
const dateFormat = require("dateformat");
const changeCase = require("change-case");
const dataPaths = require("./data-paths");
const contexts = require("./contexts");
const U = require("./utilities");
const settings = require("./gen-config");
const shuffleSeed = require("shuffle-seed");

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
                suburbs(context.cityRegionSuburbs, template, pageType, context);
                break;
            default:
                U.warning("No valid pageTypes specified in config");
        }
    });
};

const home = (data, template, pageType) => {
    const context = {
        ...R.mergeAll([
            contexts.general({ name: data, pageType, footerType: "home" }),
            contexts.industry({ industry: dataPaths.industry.data }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.state({ state: dataPaths.state.data }),
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
        },
        get nswRegions() {
            return U.removeAllEmpty(U.fileToList(dataPaths.stateRegions.data));
        },
        get footerBuyNswRegions() {
            return U.nswRegionFooterList(`buy-${this.industry}`, this.nswRegions);
        },
        get footerSellNswRegions() {
            return U.nswRegionFooterList(`buy-${this.industry}`, this.nswRegions);
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
        },
        get footerBreadcrumbs() {
            return U.footerBreadcrumbs([["Home", ""], [this.title, this.filename]]);
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
            return U.schema([["Home", ""], [this.title, this.prettyPath]]);
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
            get pathSegment() {
                return `${this.buySell}-${this.industry}`;
            },
            get path() {
                return [
                    settings.outputLocation,
                    this.pathSegment,
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
                return U.schema([["Home", ""], [this.pageTitle, this.path]]);
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
                contexts.home(),
                contexts.buySell({ buySell }),
                contexts.industry({ industry: dataPaths.industry.data }),
                contexts.country({ country: dataPaths.country.data }),
                contexts.state({ state: data })
            ]),
            get pathSegment() {
                return `${this.buySell}-${this.industry}`;
            },
            get path() {
                return [
                    settings.outputLocation,
                    this.pathSegment,
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
                return U.schema([["Home", ""], [this.pageTitle, this.path]]);
            },
            get regionFooterHeading() {
                return `<div class="regionFooterHeading">${this.Trade} a ${this.Industry} Business in one of ${this.NSW}’s Regions:</div>`;
            },
            get regionFooterUl() {
                return U.nswRegionFooterList(this.pathSegment, this.nswRegionList);
            },
            get footerBreadcrumbs() {
                return U.footerBreadcrumbs([["Home", ""], [this.Australia, `${this.pathSegment}/index.html`], [this.NSW, `${this.pathSegment}/${this.nsw}.html`]]);
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
                    contexts.state({ state: dataPaths.state.data }),
                    contexts.stateRegion({ stateRegion })
                ]),
                get pathSegment() {
                    return `${this.buySell}-${this.industry}`;
                },
                get path() {
                    return [
                        settings.outputLocation,
                        this.pathSegment,
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
                    return U.schema([["Home", ""], [this.pageTitle, this.path]]);
                },
                get regionFooterHeading() {
                    return `<div class="regionFooterHeading">${this.Trade} a ${this.Industry} Business in one of ${this.NameNoThe}’s Regions:</div>`;
                },
                get footerBreadcrumbs() {
                    return U.footerBreadcrumbs([["Home", ""], [this.Australia, `${this.pathSegment}/index.html`], [this.NSW, `${this.pathSegment}/${this.nsw}.html`], [this.Name, `${this.pathSegment}/${this.namenothe}.html`]]);
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
            get pathSegment() {
                return `${this.buySell}-${this.industry}`;
            },
            get path() {
                return [
                    settings.outputLocation,
                    this.pathSegment,
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
            },
            get schema() {
                return U.schema([["Home", ""], [this.Australia, `${this.pathSegment}/index.html`], [this.Name, this.prettyPath]]);
            },
            get regionFooterHeading() {
                return `<div class="regionFooterHeading">${this.Trade} a ${this.Industry} Business in one of ${this.Name}’s Regions:</div>`;
            },
            get regionFooterUl() {
                return U.cityRegionFooterList(this.pathSegment, this.name, this.cityRegionList);
            },
            get footerBreadcrumbs() {
                return U.footerBreadcrumbs([["Home", ""], [this.Australia, `${this.pathSegment}/index.html`], [this.Name, ""]]);
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
                get pathSegment() {
                    return `${this.buySell}-${this.industry}`;
                },
                get path() {
                    return [
                        settings.outputLocation,
                        this.pathSegment,
                        this.sydney,
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
                },
                get schema() {
                    return U.schema([["Home", ""], [this.Australia, `${this.pathSegment}/index.html`], [this.Sydney, `${this.pathSegment}/${this.sydney}/index.html`], [this.Name, this.prettyPath]]);
                },
                get cityRegionSuburbs() {
                    const list = U.removeAllEmpty(U.fileToList(dataPaths.cityRegions.suburbs + `${U.filenameCase(cityRegion)}.txt`));
                    const subset = R.take(Math.ceil(list.length * settings.subset), shuffleSeed.shuffle(list, cityRegion));
                    return subset;
                },
                get regionFooterHeading() {
                    return `<div class="regionFooterHeading">${this.Trade} a ${this.Industry} Business in one of ${this.Name}’s Suburbs:</div>`;
                },
                get regionFooterUl() {
                    return U.cityRegionFooterList(this.pathSegment, this.sydney, this.cityRegionSuburbs);
                },
                get footerBreadcrumbs() {
                    return U.footerBreadcrumbs([["Home", ""], [this.Australia, `${this.pathSegment}/index.html`], [this.Sydney, `${this.pathSegment}/${this.sydney}/index.html`], [this.Name, ""]]);
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
            if (settings.genSuburbs && buySell === "Buy") {
                run(["suburbs"], context);
            }
        });
    });
};

const suburbs = (data, template, pageType, parentContext) => {
    data.map(suburb =>
        dataPaths.buySell.data.map(buySell => {
            const context = {
                ...R.mergeAll([
                    parentContext,
                    contexts.general({ name: suburb, pageType, footerType: "suburb" }),
                    contexts.buySell({ buySell }),
                    contexts.suburb({ suburb })
                ]),
                get pathSegment() {
                    return `${this.buySell}-${this.industry}`;
                },
                get path() {
                    return [
                        settings.outputLocation,
                        this.pathSegment,
                        this.sydney,
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
