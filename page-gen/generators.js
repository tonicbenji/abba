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
    const context = {
        ...U.mergeDeepAll([
            contexts.general({ name: data, pageType, footerType: "page" }),
            contexts.home(),
            contexts.industry({
                industry: dataPaths.industry.data,
                buySell: "Trade"
            }),
            contexts.country({ country: dataPaths.country.data, buySell: "" }),
            contexts.about({ about: data })
        ]),
        get paths() {
            const rel = [this.filename];
            const path = R.prepend(settings.outputLocation, rel);
            const pretty = U.prettyPath(rel);
            const output = U.relPathList(path);
            const domain = settings.domain + pretty;
            return { rel, path, pretty, output, domain };
        },
        get absolutePath() {
            return this.paths.domain;
        },
        get pageTitle() {
            return "About Us";
        },
        get schema() {
            return U.schema([
                [
                    `Buy and Sell ${this.Industry} Businesses Across ${
                        this.Australia
                    }`,
                    ""
                ],
                [this.pageTitle, this.filename]
            ]);
        },
        get footerBreadcrumbs() {
            return U.footerBreadcrumbs([
                ["Home", ""],
                [this.title, this.filename]
            ]);
        },
        get keywords() {
            return U.makeKeywords({
                keywords: this.keywordLists.country,
                trade: "",
                industry: "",
                name: ""
            });
        }
    };

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
    const context = {
        ...U.mergeDeepAll([
            contexts.general({ name: data, pageType, footerType: "page" }),
            contexts.home(),
            contexts.industry({
                industry: dataPaths.industry.data,
                buySell: "Trade"
            }),
            contexts.country({ country: dataPaths.country.data, buySell: "" }),
            contexts.contact({ contact: data })
        ]),
        get paths() {
            const rel = [this.filename];
            const path = R.prepend(settings.outputLocation, rel);
            const pretty = U.prettyPath(rel);
            const output = U.relPathList(path);
            const domain = settings.domain + pretty;
            return { rel, path, pretty, output, domain };
        },
        get absolutePath() {
            return this.paths.domain;
        },
        get pageTitle() {
            return "Contact Us";
        },
        get schema() {
            return U.schema([
                [
                    `Buy and Sell ${this.Industry} Businesses Across ${
                        this.Australia
                    }`,
                    ""
                ],
                [this.pageTitle, this.paths.pretty]
            ]);
        },
        get keywords() {
            return U.makeKeywords({
                keywords: this.keywordLists.country,
                trade: "",
                industry: "",
                name: ""
            });
        }
    };

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
                contexts.state({
                    state: dataPaths.state.data,
                    buySell,
                    buySell
                }),
                contexts.country({ country: dataPaths.country.data, buySell })
            ]),
            get paths() {
                const segment = `${this.buySell}-${this.industry}`;
                const rel = [segment, this.filename];
                const path = R.prepend(settings.outputLocation, rel);
                const pretty = U.prettyPath(rel);
                const output = U.relPathList(path);
                const domain = settings.domain + pretty;
                return { segment, rel, path, pretty, output, domain };
            },
            get absolutePath() {
                return this.paths.domain;
            },
            get pageTitle() {
                return `${this.Trade}ing ${buySell === "Buy" ? "a" : "your"} ${
                    this.Industry
                } Business`;
            },
            get schema() {
                return U.schema([
                    [
                        `Buy and Sell ${this.Industry} Businesses Across ${
                            this.Australia
                        }`,
                        ""
                    ],
                    [this.pageTitle, this.paths.pretty]
                ]);
            },
            get footer() {
                return dataPaths.footer.template.country[this.trade];
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
                return U.footerBreadcrumbs([["Home", ""], [this.Name, ""]]);
            },
            get keywords() {
                return U.makeKeywords({
                    keywords: this.keywordLists,
                    trade: this.Trade,
                    industry: this.Industry,
                    name: this.Name
                });
            }
        };

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
        const context = {
            ...U.mergeDeepAll([
                contexts.general({ name: data, pageType, footerType: "state" }),
                contexts.home(),
                contexts.buySell({ buySell }),
                contexts.industry({
                    industry: dataPaths.industry.data,
                    buySell
                }),
                contexts.country({ country: dataPaths.country.data, buySell }),
                contexts.state({ state: data, buySell, buySell })
            ]),
            get paths() {
                const segment = `${this.buySell}-${this.industry}`;
                const rel = [segment, this.filename];
                const path = R.prepend(settings.outputLocation, rel);
                const pretty = U.prettyPath(rel);
                const output = U.relPathList(path);
                const domain = settings.domain + pretty;
                return { segment, rel, path, pretty, output, domain };
            },
            get absolutePath() {
                return this.paths.domain;
            },
            get pageTitle() {
                return `${this.Trade}ing a ${this.Industry} Business in ${
                    this.nameThe
                }`;
            },
            get schema() {
                return U.schema([
                    [
                        `Buy and Sell ${this.Industry} Businesses Across ${
                            this.Australia
                        }`,
                        ""
                    ],
                    [this.pageTitle, this.paths.pretty]
                ]);
            },
            get regionFooterHeading() {
                return `<div class="regionFooterHeading">${this.Trade} a ${
                    this.Industry
                } Business in one of ${this.NSW}’s Regions:</div>`;
            },
            get regionFooterUl() {
                return U.nswRegionFooterList(
                    this.paths.segment,
                    this.nswRegionList
                );
            },
            get mobileBreadcrumbs() {
                return U.mobileBreadcrumbs([
                    [this.Australia, `${this.paths.segment}/index.html`]
                ]);
            },
            get footerBreadcrumbs() {
                return U.footerBreadcrumbs([
                    ["Home", ""],
                    [this.Australia, `${this.paths.segment}/index.html`],
                    [this.NSW, `${this.paths.segment}/${this.nsw}.html`]
                ]);
            },
            get keywords() {
                return U.makeKeywords({
                    keywords: this.keywordLists,
                    trade: this.Trade,
                    industry: this.Industry,
                    name: this.Name
                });
            }
        };

        U.outputs({
            logAction: buySell,
            templatePath: template + context.buySellFilename,
            data,
            isGenSuburbs,
            context
        });
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
                    contexts.country({
                        country: dataPaths.country.data,
                        buySell
                    }),
                    contexts.state({ state: dataPaths.state.data, buySell }),
                    contexts.stateRegion({ stateRegion, buySell })
                ]),
                get paths() {
                    const segment = `${this.buySell}-${this.industry}`;
                    const rel = [segment, this.filename];
                    const path = R.prepend(settings.outputLocation, rel);
                    const pretty = U.prettyPath(rel);
                    const output = U.relPathList(path);
                    const domain = settings.domain + pretty;
                    return { segment, rel, path, pretty, output, domain };
                },
                get absolutePath() {
                    return this.paths.domain;
                },
                get pageTitle() {
                    return `${this.Trade}ing a ${this.Industry} Business in ${
                        this.nameThe
                    }`;
                },
                get schema() {
                    return U.schema([
                        [
                            `Buy and Sell ${this.Industry} Businesses Across ${
                                this.Australia
                            }`,
                            ""
                        ],
                        [this.pageTitle, this.paths.pretty]
                    ]);
                },
                get regionFooterHeading() {
                    return `<div class="regionFooterHeading">${this.Trade} a ${
                        this.Industry
                    } Business in one of ${this.NameNoThe}’s Regions:</div>`;
                },
                get mobileBreadcrumbs() {
                    return U.mobileBreadcrumbs([
                        [this.Australia, `${this.paths.segment}/index.html`],
                        [this.NSW, `${this.paths.segment}/${this.nsw}.html`]
                    ]);
                },
                get footerBreadcrumbs() {
                    return U.footerBreadcrumbs([
                        ["Home", ""],
                        [this.Australia, `${this.paths.segment}/index.html`],
                        [this.NSW, `${this.paths.segment}/${this.nsw}.html`],
                        [
                            this.Name,
                            `${this.paths.segment}/${this.namenothe}.html`
                        ]
                    ]);
                },
                get keywords() {
                    return U.makeKeywords({
                        keywords: this.keywordLists,
                        trade: this.Trade,
                        industry: this.Industry,
                        name: this.Name
                    });
                }
            };

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
        const context = {
            ...U.mergeDeepAll([
                contexts.general({ name: data, pageType, footerType: "city" }),
                contexts.buySell({ buySell }),
                contexts.industry({
                    industry: dataPaths.industry.data,
                    buySell
                }),
                contexts.country({ country: dataPaths.country.data, buySell }),
                contexts.state({ state: dataPaths.state.data, buySell }),
                contexts.city({ city: data, buySell })
            ]),
            get paths() {
                const segment = `${this.buySell}-${this.industry}`;
                const rel = [segment, data, "index.html"];
                const path = R.prepend(settings.outputLocation, rel);
                const pretty = U.prettyPath(rel);
                const output = U.relPathList(path);
                const domain = settings.domain + pretty;
                return { segment, rel, path, pretty, output, domain };
            },
            get absolutePath() {
                return this.paths.domain;
            },
            get pageTitle() {
                return `${this.Trade}ing a ${this.Industry} Business in ${
                    this.nameThe
                }`;
            },
            get schema() {
                return U.schema([
                    [
                        `Buy and Sell ${this.Industry} Businesses Across ${
                            this.Australia
                        }`,
                        ""
                    ],
                    [
                        `${this.Trade}ing ${buySell === "Buy" ? "a" : "your"} ${
                            this.Industry
                        } Business`,
                        `${this.paths.segment}/index.html`
                    ],
                    [this.pageTitle, this.paths.pretty]
                ]);
            },
            get regionFooterHeading() {
                return `<div class="regionFooterHeading">${this.Trade} a ${
                    this.Industry
                } Business in one of ${this.Name}’s Regions:</div>`;
            },
            get regionFooterUl() {
                return U.cityRegionFooterList(
                    this.paths.segment,
                    this.name,
                    this.cityRegionList
                );
            },
            get mobileBreadcrumbs() {
                return U.mobileBreadcrumbs([
                    [this.Australia, `${this.paths.segment}/index.html`],
                    [this.NSW, `${this.paths.segment}/${this.nsw}.html`]
                ]);
            },
            get footerBreadcrumbs() {
                return U.footerBreadcrumbs([
                    [
                        `Buy and Sell ${this.Industry} Businesses Across ${
                            this.Australia
                        }`,
                        ""
                    ],
                    [this.Australia, `${this.paths.segment}/index.html`],
                    [this.Name, ""]
                ]);
            },
            get keywords() {
                return U.makeKeywords({
                    keywords: this.keywordLists,
                    trade: this.Trade,
                    industry: this.Industry,
                    name: this.Name
                });
            }
        };

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
                    contexts.country({
                        country: dataPaths.country.data,
                        buySell
                    }),
                    contexts.state({ state: dataPaths.state.data, buySell }),
                    contexts.city({ city: dataPaths.city.data, buySell }),
                    contexts.cityRegion({ cityRegion, buySell })
                ]),
                get RegionNoThe() {
                    return this.NameNoThe;
                },
                get paths() {
                    const segment = `${this.buySell}-${this.industry}`;
                    const rel = [
                        segment,
                        this.sydney,
                        U.filenameFormat(cityRegion)
                    ];
                    const path = R.prepend(settings.outputLocation, rel);
                    const pretty = U.prettyPath(rel);
                    const output = U.relPathList(path);
                    const domain = settings.domain + pretty;
                    return { segment, rel, path, pretty, output, domain };
                },
                get absolutePath() {
                    return this.paths.domain;
                },
                get pageTitle() {
                    return `${this.Trade}ing a ${this.Industry} Business in ${
                        this.nameThe
                    }`;
                },
                get schema() {
                    return U.schema([
                        [
                            `Buy and Sell ${this.Industry} Businesses Across ${
                                this.Australia
                            }`,
                            ""
                        ],
                        [
                            `${this.Trade}ing ${
                                buySell === "Buy" ? "a" : "your"
                            } ${this.Industry} Business`,
                            `${this.paths.segment}/index.html`
                        ],
                        [
                            `${this.Trade}ing a ${this.Industry} Business in ${
                                this.Sydney
                            }`,
                            `${
                                this.paths.segment
                            }/${this.sydney.toLowerCase()}/index.html`
                        ],
                        [this.pageTitle, this.paths.pretty]
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
                        this.paths.segment,
                        this.sydney,
                        this.cityRegionSuburbs
                    );
                },
                get mobileBreadcrumbs() {
                    return U.mobileBreadcrumbs([
                        [this.Australia, `${this.paths.segment}/index.html`],
                        [this.NSW, `${this.paths.segment}/${this.nsw}.html`],
                        [
                            this.Sydney,
                            `${this.paths.segment}/${this.sydney}/index.html`
                        ]
                    ]);
                },
                get footerBreadcrumbs() {
                    return U.footerBreadcrumbs([
                        ["Home", ""],
                        [this.Australia, `${this.paths.segment}/index.html`],
                        [
                            this.Sydney,
                            `${
                                this.paths.segment
                            }/${this.sydney.toLowerCase()}/index.html`
                        ],
                        [this.Name, ""]
                    ]);
                },
                get keywords() {
                    return U.makeKeywords({
                        keywords: this.keywordLists,
                        trade: this.Trade,
                        industry: this.Industry,
                        name: this.Name
                    });
                }
            };

            U.outputs({
                logAction: buySell,
                templatePath: template + context.buySellFilename,
                data: cityRegion,
                isGenSuburbs,
                context
            });

            // Child generator
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
            const context = {
                ...U.mergeDeepAll([
                    parentContext,
                    contexts.general({
                        name: suburb,
                        pageType,
                        footerType: "suburb"
                    }),
                    contexts.buySell({ buySell }),
                    contexts.suburb({ suburb, buySell })
                ]),
                get paths() {
                    const segment = `${this.buySell}-${this.industry}`;
                    const rel = [segment, this.sydney, this.filename];
                    const path = R.prepend(settings.outputLocation, rel);
                    const pretty = U.prettyPath(rel);
                    const output = U.relPathList(path);
                    const domain = settings.domain + pretty;
                    return { segment, rel, path, pretty, output, domain };
                },
                get absolutePath() {
                    return this.paths.domain;
                },
                get pageTitle() {
                    return `${this.Trade}ing a ${this.Industry} Business in ${
                        this.Name
                    }, ${parentContext.NameNoThe}`;
                },
                get schema() {
                    return U.schema([
                        [
                            `Buy and Sell ${this.Industry} Businesses Across ${
                                this.Australia
                            }`,
                            ""
                        ],
                        [
                            `${this.Trade}ing ${
                                buySell === "Buy" ? "a" : "your"
                            } ${this.Industry} Business`,
                            `${this.paths.segment}/index.html`
                        ],
                        [
                            `${this.Trade}ing a ${this.Industry} Business in ${
                                this.Sydney
                            }`,
                            `${
                                this.paths.segment
                            }/${this.sydney.toLowerCase()}/index.html`
                        ],
                        [
                            `${this.Trade}ing a ${this.Industry} Business in ${
                                parentContext.nameThe
                            }`,
                            `${this.paths.segment}/sydney/${
                                parentContext.filename
                            }`
                        ],
                        [this.pageTitle, this.paths.pretty]
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
                        this.paths.segment,
                        this.sydney,
                        this.nearbySuburbs
                    );
                },
                get keywords() {
                    return U.makeKeywords({
                        keywords: this.keywordLists,
                        trade: this.Trade,
                        industry: this.Industry,
                        name: this.Name
                    });
                },
                get mobileBreadcrumbs() {
                    return U.mobileBreadcrumbs([
                        [this.Australia, `${this.paths.segment}/index.html`],
                        [this.NSW, `${this.paths.segment}/${this.nsw}.html`],
                        [
                            this.Sydney,
                            `${this.paths.segment}/${this.sydney}/index.html`
                        ],
                        [
                            this.Region,
                            `${this.paths.segment}/sydney/${
                                this.filenameregion
                            }.html`
                        ]
                    ]);
                },
                get footerBreadcrumbs() {
                    return U.footerBreadcrumbs([
                        ["Home", ""],
                        [this.Australia, `${this.paths.segment}/index.html`],
                        [
                            this.Sydney,
                            `${this.paths.segment}/${this.sydney}/index.html`
                        ],
                        [
                            this.Region,
                            `${this.paths.segment}/sydney/${
                                this.filenameregion
                            }.html`
                        ],
                        [this.Name, ""]
                    ]);
                }
            };

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
            contexts.country({ country: dataPaths.country.data, buySell: "" }),
            contexts.state({ state: dataPaths.state.data, buySell: "" }),
            contexts.city({ city: dataPaths.city.data, buySell: "" }),
            contexts.directory()
        ]),
        get paths() {
            const rel = [this.filename];
            const path = R.prepend(settings.outputLocation, rel);
            const pretty = U.prettyPath(rel);
            const output = U.relPathList(path);
            const domain = settings.domain + pretty;
            return { rel, path, pretty, output, domain };
        },
        get absolutePath() {
            return this.paths.domain;
        },
        get pageTitle() {
            return `Buy or Sell a ${
                this.Industry
            } Business in Australian Suburbs and Regions`;
        },
        get schema() {
            return U.schema([
                [
                    `Buy and Sell ${this.Industry} Businesses Across ${
                        this.Australia
                    }`,
                    ""
                ],
                [this.pageTitle, this.filename]
            ]);
        },
        get keywords() {
            return U.makeKeywords({
                keywords: this.keywordLists.country,
                trade: "",
                industry: "",
                name: ""
            });
        },
        get directoryList() {
            return dataPaths.buySell.data
                .map(buySell => {
                    const directoryUl = s => `<ul id="directoryUl">${s}</ul>`;
                    return (
                        `<a href="${
                            this.industry
                        }-${buySell.toLowerCase()}/index.html"><h4>${buySell} ${
                            this.Industry
                        } in ${this.Australia}&nbsp;»</h4></a>` +
                        `<a href="${this.industry}-${buySell.toLowerCase()}/${
                            this.nsw
                        }.html"><h5>${buySell} ${this.Industry} in ${
                            this.NSW
                        }&nbsp;»</h5></a>` +
                        directoryUl(
                            this.nswRegionList
                                .map(stateRegion => {
                                    return `<li><a href="/${buySell.toLowerCase()}-${
                                        this.industry
                                    }/${U.filenameFormat(
                                        stateRegion
                                    )}">${buySell} a ${
                                        this.Industry
                                    } Business in <strong>${stateRegion}</strong>&nbsp;»</a></li>`;
                                })
                                .join("")
                        ) +
                        `<a href="${this.industry}-${buySell.toLowerCase()}/${
                            this.sydney
                        }/index.html"><h6>${buySell} ${this.Industry} in ${
                            this.Sydney
                        }&nbsp;»</h6></a>` +
                        U.removeAllEmpty(
                            U.fileToList(dataPaths.cityRegions.data)
                        )
                            .map(cityRegion => {
                                const cityRegionSuburbs = () => {
                                    const list = U.removeAllEmpty(
                                        U.fileToList(
                                            dataPaths.cityRegions.suburbs +
                                                `${U.filenameCase(
                                                    cityRegion
                                                )}.txt`
                                        )
                                    );
                                    const subset = R.take(
                                        Math.ceil(
                                            list.length * settings.subset
                                        ),
                                        shuffleSeed.shuffle(list, cityRegion)
                                    );
                                    return subset;
                                };
                                return (
                                    `<a href="/${buySell.toLowerCase()}-${
                                        this.industry
                                    }/${U.filenameFormat(
                                        cityRegion
                                    )}"><h6 class="h7">${buySell} a ${
                                        this.Industry
                                    } Business in ${changeCase.titleCase(
                                        cityRegion
                                    )}&nbsp;»</h6></a>` +
                                    directoryUl(
                                        cityRegionSuburbs()
                                            .map(suburb => {
                                                return `<li><a href="/${buySell.toLowerCase()}-${
                                                    this.industry
                                                }/${
                                                    this.sydney
                                                }/${U.filenameFormat(
                                                    suburb
                                                )}">${buySell} a ${
                                                    this.Industry
                                                } Business in <strong>${changeCase.titleCase(
                                                    suburb
                                                )},<br>${changeCase.titleCase(
                                                    cityRegion
                                                )}</strong></a></li>`;
                                            })
                                            .join("")
                                    )
                                );
                            })
                            .join("")
                    );
                })
                .join("");
        },
        get footerBreadcrumbs() {
            return U.footerBreadcrumbs([["Home", ""], [this.Name, ""]]);
        }
    };

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
