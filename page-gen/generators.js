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
    const context = {
        ...U.mergeDeepAll([
            contexts.general({ name: data, pageType, footerType: "home" }),
            contexts.industry({
                industry: dataPaths.industry.data,
                buySell: "Trade"
            }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.state({ state: dataPaths.state.data }),
            contexts.home()
        ]),
        get paths() {
            const rel = [ this.filename ];
            const path = R.prepend(settings.outputLocation, rel);
            const pretty = U.prettyPath(rel)
            const output = U.relPathList(path)
            const domain = settings.domain + pretty
            return { rel, path, pretty, output, domain };
        },
        get schema() {
            return U.schema([[this.home, ""]]);
        },
        get nswRegions() {
            return U.removeAllEmpty(U.fileToList(dataPaths.stateRegions.data));
        },
        get footerBuyNswRegions() {
            return U.nswRegionFooterList(
                `buy-${this.industry}`,
                this.nswRegions
            );
        },
        get footerSellNswRegions() {
            return U.nswRegionFooterList(
                `sell-${this.industry}`,
                this.nswRegions
            );
        },
        get keywords() {
            return U.makeKeywords(this.keywordLists);
        }
    };

    U.outputs({ logAction: "Single", templatePath: template, data, context })
};

const about = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const context = {
        ...U.mergeDeepAll([
            contexts.general({ name: data, pageType, footerType: "page" }),
            contexts.home(),
            contexts.industry({
                industry: dataPaths.industry.data,
                buySell: "Trade"
            }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.about({ about: data })
        ]),
        get paths() {
            const rel = [ this.filename ];
            const path = R.prepend(settings.outputLocation, rel);
            const pretty = U.prettyPath(rel)
            const output = U.relPathList(path)
            const domain = settings.domain + pretty
            return { rel, path, pretty, output, domain };
        },
        get schema() {
            return U.schema([[this.home, ""], [this.title, this.filename]]);
        },
        get footerBreadcrumbs() {
            return U.footerBreadcrumbs([
                ["Home", ""],
                [this.title, this.filename]
            ]);
        },
        get keywords() {
            return U.makeKeywords(this.keywordLists);
        }
    };

    U.outputs({ logAction: "Single", templatePath: template, data, context })
};

const contact = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const context = {
        ...U.mergeDeepAll([
            contexts.general({ name: data, pageType, footerType: "page" }),
            contexts.home(),
            contexts.industry({
                industry: dataPaths.industry.data,
                buySell: "Trade"
            }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.contact({ contact: data })
        ]),
        get paths() {
            const rel = [ this.filename ];
            const path = R.prepend(settings.outputLocation, rel);
            const pretty = U.prettyPath(rel)
            const output = U.relPathList(path)
            const domain = settings.domain + pretty
            return { rel, path, pretty, output, domain };
        },
        get schema() {
            return U.schema([["Home", ""], [this.title, this.prettyPath]]);
        },
        get keywords() {
            return U.makeKeywords(this.keywordLists);
        }
    };

    U.outputs({ logAction: "Single", templatePath: template, data, context })
};

const country = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    dataPaths.buySell.data.map(buySell => {
        const context = {
            ...U.mergeDeepAll([
                contexts.general({
                    name: data,
                    pageType,
                    footerType: "country"
                }),
                contexts.home(),
                contexts.buySell({ buySell }),
                contexts.industry({
                    industry: dataPaths.industry.data,
                    buySell
                }),
                contexts.state({ state: dataPaths.state.data }),
                contexts.country({ country: dataPaths.country.data })
            ]),
            get paths() {
                const segment = `${this.buySell}-${this.industry}`;
                const rel = [ segment, this.filename ];
                const path = R.prepend(settings.outputLocation, rel);
                const pretty = U.prettyPath(rel)
                const output = U.relPathList(path)
                const domain = settings.domain + pretty
                return { segment, rel, path, pretty, output, domain };
            },
            get pageTitle() {
                return `${this.Trade} ${this.Industry} in ${this.Name}`;
            },
            get schema() {
                return U.schema([["Home", ""], [this.pageTitle, this.paths.pretty]]);
            },
            get footer() {
                return dataPaths.footer.template.country[this.trade]
            },
            get footerBuyNswRegions() {
                return U.nswRegionFooterList(
                    `buy-${this.industry}`,
                    this.nswRegionList
                );
            },
            get footerSellNswRegions() {
                return U.nswRegionFooterList(
                    `sell-${this.industry}`,
                    this.nswRegionList
                );
            },
            get footerBreadcrumbs() {
                return U.footerBreadcrumbs([
                    ["Home", ""],
                    [this.Name, ""]
                ]);
            },
            get keywords() {
                return U.makeKeywords(
                    R.merge(
                        this.keywordLists,
                        U.contextualKeywords({
                            trade: this.Trade,
                            industry: this.Industry,
                            name: this.Name
                        })
                    )
                );
            }
        };
        console.log(context.paths);

        U.outputs({ logAction: buySell, templatePath: template + context.buySellFilename, data, context })
    });
};

const state = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    dataPaths.buySell.data.map(buySell => {
        const context = {
            ...U.mergeDeepAll([
                contexts.general({ name: data, pageType, footerType: "state" }),
                contexts.home(),
                contexts.buySell({ buySell }),
                contexts.industry({
                    industry: dataPaths.industry.data,
                    buySell
                }),
                contexts.country({ country: dataPaths.country.data }),
                contexts.state({ state: data })
            ]),
            get paths() {
                const segment = `${this.buySell}-${this.industry}`;
                const rel = [ segment, this.filename ];
                const path = R.prepend(settings.outputLocation, rel);
                const pretty = U.prettyPath(rel)
                const output = U.relPathList(path)
                const domain = settings.domain + pretty
                return { segment, rel, path, pretty, output, domain };
            },
            get schema() {
                return U.schema([["Home", ""], [this.pageTitle, this.path]]);
            },
            get regionFooterHeading() {
                return `<div class="regionFooterHeading">${this.Trade} a ${
                    this.Industry
                } Business in one of ${this.NSW}’s Regions:</div>`;
            },
            get regionFooterUl() {
                return U.nswRegionFooterList(
                    this.pathSegment,
                    this.nswRegionList
                );
            },
            get mobileBreadcrumbs() {
                return U.mobileBreadcrumbs([
                    [this.Australia, `${this.pathSegment}/index.html`]
                ]);
            },
            get footerBreadcrumbs() {
                return U.footerBreadcrumbs([
                    ["Home", ""],
                    [this.Australia, `${this.pathSegment}/index.html`],
                    [this.NSW, `${this.pathSegment}/${this.nsw}.html`]
                ]);
            },
            get keywords() {
                return U.makeKeywords(
                    R.merge(
                        this.keywordLists,
                        U.contextualKeywords({
                            trade: this.Trade,
                            industry: this.Industry,
                            name: this.Name
                        })
                    )
                );
            }
        };

        U.outputs({ logAction: buySell, templatePath: template + context.buySellFilename, data, context })
    });
};

const stateRegions = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const stateRegions = U.removeAllEmpty(U.fileToList(data));
    stateRegions.map(stateRegion => {
        dataPaths.buySell.data.map(buySell => {
            const context = {
                ...U.mergeDeepAll([
                    contexts.general({
                        name: stateRegion,
                        pageType,
                        footerType: "stateRegion"
                    }),
                    contexts.buySell({ buySell }),
                    contexts.industry({
                        industry: dataPaths.industry.data,
                        buySell
                    }),
                    contexts.country({ country: dataPaths.country.data }),
                    contexts.state({ state: dataPaths.state.data }),
                    contexts.stateRegion({ stateRegion })
                ]),
                get paths() {
                    const segment = `${this.buySell}-${this.industry}`;
                    const rel = [ segment, this.filename ];
                    const path = R.prepend(settings.outputLocation, rel);
                    const pretty = U.prettyPath(rel)
                    const output = U.relPathList(path)
                    const domain = settings.domain + pretty
                    return { segment, rel, path, pretty, output, domain };
                },
                get schema() {
                    return U.schema([
                        ["Home", ""],
                        [this.pageTitle, this.path]
                    ]);
                },
                get regionFooterHeading() {
                    return `<div class="regionFooterHeading">${this.Trade} a ${
                        this.Industry
                    } Business in one of ${this.NameNoThe}’s Regions:</div>`;
                },
                get mobileBreadcrumbs() {
                    return U.mobileBreadcrumbs([
                        [this.Australia, `${this.pathSegment}/index.html`],
                        [this.NSW, `${this.pathSegment}/${this.nsw}.html`]
                    ]);
                },
                get footerBreadcrumbs() {
                    return U.footerBreadcrumbs([
                        ["Home", ""],
                        [this.Australia, `${this.pathSegment}/index.html`],
                        [this.NSW, `${this.pathSegment}/${this.nsw}.html`],
                        [
                            this.Name,
                            `${this.pathSegment}/${this.namenothe}.html`
                        ]
                    ]);
                },
                get keywords() {
                    return U.makeKeywords(
                        R.merge(
                            this.keywordLists,
                            U.contextualKeywords({
                                trade: this.Trade,
                                industry: this.Industry,
                                name: this.Name
                            })
                        )
                    );
                }
            };

            U.outputs({ logAction: buySell, templatePath: template + context.buySellFilename, data: stateRegion, context })
        });
    });
};

const city = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    dataPaths.buySell.data.map(buySell => {
        const context = {
            ...U.mergeDeepAll([
                contexts.general({ name: data, pageType, footerType: "city" }),
                contexts.buySell({ buySell }),
                contexts.industry({
                    industry: dataPaths.industry.data,
                    buySell
                }),
                contexts.country({ country: dataPaths.country.data }),
                contexts.state({ state: dataPaths.state.data }),
                contexts.city({ city: data })
            ]),
            get paths() {
                const segment = `${this.buySell}-${this.industry}`;
                const rel = [ segment, data, "index.html" ];
                const path = R.prepend(settings.outputLocation, rel);
                const pretty = U.prettyPath(rel)
                const output = U.relPathList(path)
                const domain = settings.domain + pretty
                return { segment, rel, path, pretty, output, domain };
            },
            get schema() {
                return U.schema([
                    ["Home", ""],
                    [this.Australia, `${this.pathSegment}/index.html`],
                    [this.Name, this.prettyPath]
                ]);
            },
            get regionFooterHeading() {
                return `<div class="regionFooterHeading">${this.Trade} a ${
                    this.Industry
                } Business in one of ${this.Name}’s Regions:</div>`;
            },
            get regionFooterUl() {
                return U.cityRegionFooterList(
                    this.pathSegment,
                    this.name,
                    this.cityRegionList
                );
            },
            get mobileBreadcrumbs() {
                return U.mobileBreadcrumbs([
                    [this.Australia, `${this.pathSegment}/index.html`],
                    [this.NSW, `${this.pathSegment}/${this.nsw}.html`]
                ]);
            },
            get footerBreadcrumbs() {
                return U.footerBreadcrumbs([
                    ["Home", ""],
                    [this.Australia, `${this.pathSegment}/index.html`],
                    [this.Name, ""]
                ]);
            },
            get keywords() {
                return U.makeKeywords(
                    R.merge(
                        this.keywordLists,
                        U.contextualKeywords({
                            trade: this.Trade,
                            industry: this.Industry,
                            name: this.Name
                        })
                    )
                );
            }
        };

        U.outputs({ logAction: buySell, templatePath: template + context.buySellFilename, data, context })
    });
};

const cityRegions = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const cityRegions = U.removeAllEmpty(U.fileToList(data));
    cityRegions.map(cityRegion => {
        dataPaths.buySell.data.map(buySell => {
            const context = {
                ...U.mergeDeepAll([
                    contexts.general({
                        name: cityRegion,
                        pageType,
                        footerType: "city"
                    }),
                    contexts.buySell({ buySell }),
                    contexts.industry({
                        industry: dataPaths.industry.data,
                        buySell
                    }),
                    contexts.country({ country: dataPaths.country.data }),
                    contexts.state({ state: dataPaths.state.data }),
                    contexts.city({ city: dataPaths.city.data }),
                    contexts.cityRegion({ cityRegion })
                ]),
                get RegionNoThe() {
                    return this.NameNoThe;
                },
                get paths() {
                    const segment = `${this.buySell}-${this.industry}`;
                    const rel = [ segment, this.sydney, U.filenameFormat(cityRegion) ];
                    const path = R.prepend(settings.outputLocation, rel);
                    const pretty = U.prettyPath(rel)
                    const output = U.relPathList(path)
                    const domain = settings.domain + pretty
                    return { segment, rel, path, pretty, output, domain };
                },
                get schema() {
                    return U.schema([
                        ["Home", ""],
                        [this.Australia, `${this.pathSegment}/index.html`],
                        [
                            this.Sydney,
                            `${this.pathSegment}/${this.sydney}/index.html`
                        ],
                        [this.Name, this.prettyPath]
                    ]);
                },
                get cityRegionSuburbs() {
                    const list = U.removeAllEmpty(
                        U.fileToList(
                            dataPaths.cityRegions.suburbs +
                                `${U.filenameCase(cityRegion)}.txt`
                        )
                    );
                    const subset = R.take(
                        Math.ceil(list.length * settings.subset),
                        shuffleSeed.shuffle(list, cityRegion)
                    );
                    return subset;
                },
                get regionFooterHeading() {
                    return R.isEmpty(this.cityRegionSuburbs)
                        ? ""
                        : `<div class="regionFooterHeading">${this.Trade} a ${
                              this.Industry
                          } Business in one of ${this.Name}’s Suburbs:</div>`;
                },
                get regionFooterUl() {
                    return U.cityRegionFooterList(
                        this.pathSegment,
                        this.sydney,
                        this.cityRegionSuburbs
                    );
                },
                get mobileBreadcrumbs() {
                    return U.mobileBreadcrumbs([
                        [this.Australia, `${this.pathSegment}/index.html`],
                        [this.NSW, `${this.pathSegment}/${this.nsw}.html`],
                        [this.Sydney, `${this.pathSegment}/${this.sydney}/index.html`]
                    ]);
                },
                get footerBreadcrumbs() {
                    return U.footerBreadcrumbs([
                        ["Home", ""],
                        [this.Australia, `${this.pathSegment}/index.html`],
                        [
                            this.Sydney,
                            `${this.pathSegment}/${this.sydney}/index.html`
                        ],
                        [this.Name, ""]
                    ]);
                },
                get keywords() {
                    return U.makeKeywords(
                        R.merge(
                            this.keywordLists,
                            U.contextualKeywords({
                                trade: this.Trade,
                                industry: this.Industry,
                                name: this.Name
                            })
                        )
                    );
                }
            };

            U.outputs({ logAction: buySell, templatePath: template + context.buySellFilename, data: cityRegion, context })

            // Child generator
            if (settings.genSuburbs && buySell === "Buy") {
                run(["suburbs"], context);
            }
        });
    });
};

const suburbs = (data, template, pageType, parentContext) => {
    U.headerLog(changeCase.titleCase(`${parentContext.name} ${pageType}`));
    data.map(suburb =>
        dataPaths.buySell.data.map(buySell => {
            const context = {
                ...U.mergeDeepAll([
                    parentContext,
                    contexts.general({
                        name: suburb,
                        pageType,
                        footerType: "suburb"
                    }),
                    contexts.buySell({ buySell }),
                    contexts.suburb({ suburb })
                ]),
                get pathSegment() {
                    return `${this.buySell}-${this.industry}`;
                },
                get paths() {
                    const segment = `${this.buySell}-${this.industry}`;
                    const rel = [ segment, this.sydney, this.filename ];
                    const path = R.prepend(settings.outputLocation, rel);
                    const pretty = U.prettyPath(rel)
                    const output = U.relPathList(path)
                    const domain = settings.domain + pretty
                    return { segment, rel, path, pretty, output, domain };
                },
                get schema() {
                    return U.schema([
                        ["Home", ""],
                        [this.Australia, `${this.pathSegment}/index.html`],
                        [
                            this.Sydney,
                            `${this.pathSegment}/${this.sydney}/index.html`
                        ],
                        [this.Region, `${this.pathSegment}/sydney/${this.filenameRegion}.html`],
                        [this.Name, this.prettyPath]
                    ]);
                },
                get nearbySuburbs() {
                    return R.intersection(
                        dataPaths.suburbs.nearby[suburb],
                        this.cityRegionSuburbs
                    );
                },
                get nearbySuburbsHeading() {
                    return R.isEmpty(this.nearbySuburbs)
                        ? ""
                        : `<div class="regionFooterHeading">${
                              this.Trade
                          }ing a ${
                              this.Industry
                          } Business in Nearby Suburbs:</div>`;
                },
                get nearby() {
                    return U.cityRegionFooterList(
                        this.pathSegment,
                        this.sydney,
                        this.nearbySuburbs
                    );
                },
                get keywords() {
                    return U.makeKeywords(
                        R.merge(
                            this.keywordLists,
                            U.contextualKeywords({
                                trade: this.Trade,
                                industry: this.Industry,
                                name: this.Name
                            })
                        )
                    );
                },
                get mobileBreadcrumbs() {
                    return U.mobileBreadcrumbs([
                        [this.Australia, `${this.pathSegment}/index.html`],
                        [this.NSW, `${this.pathSegment}/${this.nsw}.html`],
                        [this.Sydney, `${this.pathSegment}/${this.sydney}/index.html`],
                        [this.Region, `${this.pathSegment}/sydney/${this.filenameregion}.html`]
                    ]);
                },
                get footerBreadcrumbs() {
                    return U.footerBreadcrumbs([
                        ["Home", ""],
                        [this.Australia, `${this.pathSegment}/index.html`],
                        [
                            this.Sydney,
                            `${this.pathSegment}/${this.sydney}/index.html`
                        ],
                        [this.Region, `${this.pathSegment}/sydney/${this.filenameregion}.html`],
                        [this.Name, ""]
                    ]);
                }
            };

            U.outputs({ logAction: buySell, templatePath: template + context.buySellFilename, data: suburb, context })
        })
    );
};

const directory = (data, template, pageType) => {
    U.headerLog(changeCase.titleCase(pageType));
    const context = {
        ...U.mergeDeepAll([
            contexts.general({
                name: pageType,
                pageType,
                footerType: "page"
            }),
            contexts.home(),
            contexts.industry({
                industry: dataPaths.industry.data,
                buySell: "Trade"
            }),
            contexts.country({ country: dataPaths.country.data }),
            contexts.state({ state: dataPaths.state.data }),
            contexts.city({ city: dataPaths.city.data }),
            contexts.directory(),
        ]),
        get paths() {
            const segment = `${this.buySell}-${this.industry}`;
            const rel = [ segment, this.filename ];
            const path = R.prepend(settings.outputLocation, rel);
            const pretty = U.prettyPath(rel)
            const output = U.relPathList(path)
            const domain = settings.domain + pretty
            return { segment, rel, path, pretty, output, domain };
        },
        get schema() {
            return U.schema([[this.home, ""], [this.title, this.filename]]);
        },
        get keywords() {
            return U.makeKeywords(this.keywordLists);
        },
        get directoryList() {
            return dataPaths.buySell.data.map(buySell => {
                const directoryUl = s => `<ul id="directoryUl">${s}</ul>`
                return `<a href="${this.industry}-${buySell.toLowerCase()}/index.html"><h4>${buySell} ${this.Industry} in ${this.Australia}&nbsp;»</h4></a>`
                    + `<a href="${this.industry}-${buySell.toLowerCase()}/${this.nsw}.html"><h5>${buySell} ${this.Industry} in ${this.NSW}&nbsp;»</h5></a>`
                    + directoryUl(this.nswRegionList.map(stateRegion => {
                        return `<li><a href="/${buySell.toLowerCase()}-${this.industry}/${U.filenameFormat(stateRegion)}">${buySell} a ${this.Industry} Business in <strong>${stateRegion}</strong>&nbsp;»</a></li>`
                    }).join(""))
                    + `<a href="${this.industry}-${buySell.toLowerCase()}/${this.sydney}/index.html"><h6>${buySell} ${this.Industry} in ${this.Sydney}&nbsp;»</h6></a>`
                    + U.removeAllEmpty(U.fileToList(dataPaths.cityRegions.data)).map(cityRegion => {
                        const cityRegionSuburbs = () => {
                            const list = U.removeAllEmpty(
                                U.fileToList(
                                    dataPaths.cityRegions.suburbs +
                                        `${U.filenameCase(cityRegion)}.txt`
                                )
                            );
                            const subset = R.take(
                                Math.ceil(list.length * settings.subset),
                                shuffleSeed.shuffle(list, cityRegion)
                            );
                            return subset;
                        }
                        return `<a href="/${buySell.toLowerCase()}-${this.industry}/${U.filenameFormat(cityRegion)}"><h6 class="h7">${buySell} a ${this.Industry} Business in ${changeCase.titleCase(cityRegion)}&nbsp;»</h6></a>`
                            + directoryUl(cityRegionSuburbs().map(suburb => {
                                return `<li><a href="/${buySell.toLowerCase()}-${this.industry}/${this.sydney}/${U.filenameFormat(suburb)}">${buySell} a ${this.Industry} Business in <strong>${changeCase.titleCase(suburb)},<br>${changeCase.titleCase(cityRegion)}</strong></a></li>`;
                            }).join(""));
                    }).join("");
            }).join("");
        },
        get footerBreadcrumbs() {
            return U.footerBreadcrumbs([
                ["Home", ""],
                [this.Name, ""]
            ]);
        }
    };

    U.outputs({ logAction: "Single", templatePath: template, data: context.Name, context })
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
