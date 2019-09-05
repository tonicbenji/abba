const R = require("ramda");
const changeCase = require("change-case");
const settings = require("./gen-config");
const U = require("./utilities");
const dataPaths = require("./data-paths");
const shuffleSeed = require("shuffle-seed");

const contextItem = (f, key, value) => {
    return {
        [f(key)]: f(value)
    };
};

const contextMaker = (key, value) => {
    const key_ = !R.isEmpty(key) ? key : value;
    const toLower = contextItem(R.toLower, key_, value);
    const toUpper = contextItem(R.toLower, key_, value);
    const titleCase = contextItem(changeCase.titleCase, key_, value);
    const camelCase = contextItem(changeCase.camelCase, key_, value);
    const constantCase = contextItem(changeCase.constantCase, key_, value);
    const nameToLower = contextItem(R.toLower, "name", value);
    const nameToUpper = contextItem(R.toUpper, "name", value);
    const nameTitleCase = contextItem(changeCase.titleCase, "name", value);
    const nameCamelCase = contextItem(changeCase.camelCase, key_, value);
    const nameConstantCase = contextItem(
        changeCase.constantCase,
        "name",
        value
    );
    const nameFilename = contextItem(U.filenameCase, `filename${key_}`, value);
    const filename = U.filenameFormat(value);
    const nameThe = U.theToLower(R.toLower(value));
    const NameThe = U.theToLower(changeCase.titleCase(value));
    return {
        ...toLower,
        ...toUpper,
        ...titleCase,
        ...camelCase,
        ...constantCase,
        ...nameToLower,
        ...nameToUpper,
        ...nameTitleCase,
        ...nameCamelCase,
        ...nameConstantCase,
        ...nameFilename,
        nameThe,
        NameThe,
        filename
    };
};

const components = ({ footerType }) => {
    const path = "src/templates/components/";
    const files = R.fromPairs(
        R.map(x => [x, U.fileToStr(path + `${x}.html`)], [
            "bottomScripts",
            "contactForm",
            "header",
            "meta"
        ])
    );
    const footer = dataPaths.footer.template[footerType];
    const dataPathsComponents = dataPaths.components;
    return {
        ...files,
        footer,
        ...dataPathsComponents
    };
};

const general = context => {
    const { name, pageType, footerType } = context.input;
    return R.mergeDeepRight(context, {
        ...components({ footerType }),
        ...contextMaker("BusinessName", settings.business.name),
        BusinessName: changeCase.titleCase(settings.business.name),
        ...contextMaker("", name),
        nameNoThe: U.noThe(name.toLowerCase()),
        NameNoThe: U.noThe(changeCase.titleCase(name)),
        NAMENOTHE: U.noThe(name.toUpperCase()),
        domain: settings.domain,
        Domain: U.escForwardSlashes(settings.domain),
        mobileBreadcrumbs: "",
        keywordsList: [
            "Buy a childcare business NSW",
            "Sell a childcare business NSW",
            "How to buy a childcare business NSW",
            "How to sell a childcare business NSW",
            "Childcare business acquisition NSW",
            "Childcare business merger NSW"
        ]
    });
};

const buySell = context => {
    const { buySell } = context.input;
    return R.mergeDeepRight(context, {
        ...contextMaker("buySell", buySell),
        ...contextMaker("trade", buySell),
        buySellFilename: U.filenameFormat(buySell)
    });
};

const industry = context => {
    const { industry } = context.input;
    return R.mergeDeepRight(context, contextMaker("industry", industry));
};

const home = context => {
    const {
        input: {
            footerType
        },
        industry,
        Industry,
        nswRegionList,
        Australia,
        keywordsList: keywordsList_
    } = context;
    const title = "Buy and Sell Childcare Businesses across Australia";
    const filename = "index.html";
    const rel = [filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { rel, path, pretty, output, domain };
    const absolutePath = domain;
    const pageTitle = `Buy and Sell ${Industry} Businesses Across ${Australia}`;
    const schema = U.schema([[pageTitle, ""]]);
    const footer = dataPaths.footer.template[footerType];
    const footerBuyNswRegions = nswRegionList
        ? U.nswRegionFooterList(`buy-${industry}`, nswRegionList)
        : "";
    const footerSellNswRegions = nswRegionList
        ? U.nswRegionFooterList(`sell-${industry}`, nswRegionList)
        : "";
    const description = U.description(
        "The Abba Group are Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity."
    );
    const id = U.id("home");
    const footerBreadcrumbs = "";
    const home = title;
    const keywordsList = U.keywordsReducer({ seed: title, prev: keywordsList_, next: [] });
    const keywords = U.keywordsFormat(keywordsList);
    return R.mergeDeepRight(context, {
        title,
        home,
        filename,
        footerBreadcrumbs,
        id,
        paths,
        absolutePath,
        pageTitle,
        schema,
        footer,
        footerBuyNswRegions,
        footerSellNswRegions,
        keywordsList,
        keywords,
        description
    });
};

const about = context => {
    const {
        input: { name, footerType },
        Industry,
        Australia,
        keywordsList: keywordsList_
    } = context;
    const title = name;
    const filename = U.filenameFormat(name);
    const id = U.id(name);
    const rel = [filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { rel, path, pretty, output, domain };
    const absolutePath = domain;
    const pageTitle = "About Us";
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [pageTitle, filename]
    ]);
    const footer = dataPaths.footer.template[footerType];
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [title, filename]
    ]);
    const keywordsList = U.keywordsReducer({ seed: title, prev: keywordsList_, next: [ "About ABBA Group" ] });
    const keywords = U.keywordsFormat(keywordsList);
    const description = U.description(
        "About ABBA Group, Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity."
    );
    return R.mergeDeepRight(context, {
        title,
        filename,
        id,
        paths,
        absolutePath,
        pageTitle,
        schema,
        footer,
        footerBreadcrumbs,
        keywordsList,
        keywords,
        description
    });
};

const contact = context => {
    const {
        input: { name, footerType },
        Industry,
        Australia,
        keywordsList: keywordsList_
    } = context;
    const title = name;
    const filename = U.filenameFormat(name);
    const id = U.id(name);
    const rel = [filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { rel, path, pretty, output, domain };
    const absolutePath = domain;
    const pageTitle = "Contact Us";
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [pageTitle, filename]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [title, filename]
    ]);
    const footer = dataPaths.footer.template[footerType];
    const keywordsList = U.keywordsReducer({ seed: title, prev: keywordsList_, next: [ "Contact ABBA Group" ] });
    const keywords = U.keywordsFormat(keywordsList);
    const description = U.description(
        "Contact ABBA Group, Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity."
    );
    return R.mergeDeepRight(context, {
        title,
        filename,
        id,
        paths,
        absolutePath,
        pageTitle,
        schema,
        footer,
        footerBreadcrumbs,
        keywordsList,
        keywords,
        description
    });
};

const country = context => {
    const {
        input: { country, buySell },
        trade,
        Trade,
        industry,
        Industry,
        Australia,
        nswRegionList,
        keywordsList: keywordsList_
    } = context;
    const nameMaker = contextMaker("", country);
    const title = country;
    const Title = changeCase.titleCase(country);
    const pageTitle = `${Trade}ing ${
        buySell === "Buy" ? "a" : "your"
    } ${Industry} Business`;
    const filename = "index.html";
    const segment = `${trade}-${industry}`;
    const rel = [segment, filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { segment, rel, path, pretty, output, domain };
    const absolutePath = domain;
    const heroImg = "";
    const contentImg = "childcare-businesses-sydney.jpg";
    const id = U.id("aus");
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [pageTitle, paths.pretty]
    ]);
    const footer = dataPaths.footer.template.country[trade];
    const footerBuyNswRegions = nswRegionList
        ? U.nswRegionFooterList(`buy-${industry}`, nswRegionList)
        : [];
    const footerSellNswRegions = nswRegionList
        ? U.nswRegionFooterList(`sell-${industry}`, nswRegionList)
        : [];
    const footerBreadcrumbs = U.footerBreadcrumbs([["Home", ""], [Title, ""]]);
    const keywordsList = U.keywordsReducer({ seed: title, prev: keywordsList_, next: [
        `${country} ${settings.business.trade}`,
        `${settings.business.name} ${settings.business.trade} ${country}`
    ]});
    const keywords = U.keywordsFormat(keywordsList);
    return R.mergeDeepRight(context, {
        ...nameMaker,
        title,
        Title,
        pageTitle,
        filename,
        paths,
        absolutePath,
        heroImg,
        contentImg,
        id,
        keywordsList,
        schema,
        footer,
        footerBuyNswRegions,
        footerSellNswRegions,
        footerBreadcrumbs,
        keywords
    });
};

const state = context => {
    const {
        input: { state, buySell, footerType },
        trade,
        Trade,
        industry,
        Industry,
        Australia,
        keywordsList: keywordsList_
    } = context;
    const nameMaker = contextMaker("", state);
    const stateMaker = contextMaker(state, state);
    const nsw = state.toUpperCase();
    const Nsw = state.toUpperCase();
    const NSW = state.toUpperCase();
    const name = state.toUpperCase();
    const Name = state.toUpperCase();
    const nameThe = state.toUpperCase();
    const NameThe = state.toUpperCase();
    const nameNoThe = state.toUpperCase();
    const NameNoThe = state.toUpperCase();
    const nswRegionList = U.removeAllEmpty(
        U.fileToList(dataPaths.stateRegions.data)
    );
    const filename = "nsw.html";
    const segment = `${trade}-${industry}`;
    const rel = [segment, filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { segment, rel, path, pretty, output, domain };
    const absolutePath = domain;
    const heroImg = "preschool-business-brokers-nsw-2.jpg";
    const contentImg = "children-playing-nsw-childcare-businesses.jpg";
    const id = U.id("nsw");
    const pageTitle = `${Trade}ing a ${Industry} Business in ${NSW}`;
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [pageTitle, paths.pretty]
    ]);
    const footer = dataPaths.footer.template[footerType];
    const regionFooterHeading = `<div class="regionFooterHeading">${Trade} a ${Industry} Business in one of ${NSW}’s Regions:</div>`;
    const regionFooterUl = nswRegionList
        ? U.nswRegionFooterList(paths.segment, nswRegionList)
        : [];
    const mobileBreadcrumbs = U.mobileBreadcrumbs([
        [Australia, `${paths.segment}/index.html`]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [Australia, `${paths.segment}/index.html`],
        [NSW, `${paths.segment}/${nsw}.html`]
    ]);
    const keywordsList = U.keywordsReducer({ seed: state, prev: keywordsList_, next: [
        `${state} ${settings.business.trade}`,
        `${settings.business.name} ${settings.business.trade} ${state}`
    ]});
    const keywords = U.keywordsFormat(keywordsList);
    const description = U.description(
        buySell === "Buy"
        ? "Reports published by the Australian government indicate that the supply of childcare is constrained by several factors in NSW, and this means that many buyers are fighting over a limited number of childcare businesses."
        : "There are many opportunities at present within the NSW childcare business market. In June 2018, the Australian Government announced that it is extending the childcare subsidy to children as young as three years."
    );
    return R.mergeDeepRight(context, {
        ...nameMaker,
        ...stateMaker,
        nsw,
        Nsw,
        name,
        Name,
        nameThe,
        NameThe,
        nameNoThe,
        NameNoThe,
        nswRegionList,
        paths,
        absolutePath,
        heroImg,
        contentImg,
        id,
        filename,
        pageTitle,
        description,
        schema,
        footer,
        regionFooterHeading,
        regionFooterUl,
        mobileBreadcrumbs,
        footerBreadcrumbs,
        keywordsList,
        keywords
    });
};

const stateRegion = context => {
    const {
        input: { stateRegion, footerType },
        trade,
        Trade,
        Australia,
        industry,
        Industry,
        NSW,
        nsw,
        keywordsList: keywordsList_
    } = context;
    const nameMaker = contextMaker("", stateRegion);
    const regionMaker = contextMaker("region", stateRegion);
    const filename = U.filenameFormat(stateRegion);
    const heroImg = "childcare-business-nsw.jpg";
    const contentImg = "preschool-business-nsw.jpg";
    const id = U.id("nswRegion");
    const segment = `${trade}-${industry}`;
    const rel = [segment, filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { segment, rel, path, pretty, output, domain };
    const absolutePath = domain;
    const pageTitle = `${Trade}ing a ${Industry} Business in ${
        nameMaker.NameThe
    }`;
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [pageTitle, paths.pretty]
    ]);
    const footer = dataPaths.footer.template[footerType];
    const regionFooterHeading = `<div class="regionFooterHeading">${Trade} a ${Industry} Business in one of ${
        nameMaker.NameNoThe
    }’s Regions:</div>`;
    const footerBuyNswRegions = "";
    const footerSellNswRegions = "";
    const footerBuyNsw = "";
    const footerSellNsw = "";
    const footerHeadingBuy = "";
    const footerHeadingSell = "";
    const mobileBreadcrumbs = U.mobileBreadcrumbs([
        [Australia, `${paths.segment}/index.html`],
        [NSW, `${paths.segment}/${nsw}.html`]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [Australia, `${paths.segment}/index.html`],
        [NSW, `${paths.segment}/${nsw}.html`],
        [nameMaker.Name, `${paths.segment}/${nameMaker.namenothe}.html`]
    ]);
    const keywordsList = U.keywordsReducer({ seed: stateRegion, prev: keywordsList_, next: [
        `${stateRegion} ${settings.business.trade}`,
        `${settings.business.name} ${settings.business.trade} ${stateRegion}`
    ]});
    const keywords = U.keywordsFormat(keywordsList);
    const description = U.description(
        buySell === "Buy"
        ? `Reports published by the Australian government indicate that the supply of childcare is constrained by several factors in ${U.theToLower(
            changeCase.titleCase(stateRegion)
        )}, and this means that many buyers are fighting over a limited number of childcare businesses.`
        : `Among the broader regulatory factors affecting the childcare business market in ${U.theToLower(
            changeCase.titleCase(stateRegion)
        )} is the Australian Government’s announcement that it is extending the childcare subsidy.`
    );
    return R.mergeDeepRight(context, {
        ...nameMaker,
        ...regionMaker,
        filename,
        heroImg,
        contentImg,
        id,
        description,
        paths,
        absolutePath,
        pageTitle,
        schema,
        footer,
        regionFooterHeading,
        mobileBreadcrumbs,
        footerBreadcrumbs,
        keywordsList,
        keywords
    });
};

const city = context => {
    const {
        input: { buySell, city },
        trade,
        Trade,
        industry,
        Industry,
        Australia,
        NSW,
        nsw,
        keywordsList: keywordsList_
    } = context;
    const cityMaker = contextMaker("", city);
    const cityRegionList = U.removeAllEmpty(
        U.fileToList(dataPaths.cityRegions.data)
    );
    const heroImg = "childcare-business-sydney.jpg";
    const contentImg = "sydney-childcare-business-little-kid.jpg";
    const id = U.id("sydney");
    const filename = `index.html`;
    const segment = `${trade}-${industry}`;
    const rel = [segment, city, filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { segment, rel, path, pretty, output, domain };
    const absolutePath = domain;
    const pageTitle = `${Trade}ing a ${Industry} Business in ${
        cityMaker.NameThe
    }`;
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [
            `${Trade}ing ${
                buySell === "Buy" ? "a" : "your"
            } ${Industry} Business`,
            `${paths.segment}/index.html`
        ],
        [pageTitle, paths.pretty]
    ]);
    const regionFooterHeading = `<div class="regionFooterHeading">${Trade} a ${Industry} Business in one of ${
        cityMaker.Name
    }’s Regions:</div>`;
    const regionFooterUl = U.cityRegionFooterList(
        paths.segment,
        cityMaker.name,
        cityRegionList
    );
    const mobileBreadcrumbs = U.mobileBreadcrumbs([
        [Australia, `${paths.segment}/index.html`],
        [NSW, `${paths.segment}/${nsw}.html`]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [Australia, `${paths.segment}/index.html`],
        [cityMaker.Name, ""]
    ]);
    const keywordsList = U.keywordsReducer({ seed: city, prev: keywordsList_, next: [
        `${city} ${settings.business.trade}`,
        `${settings.business.name} ${settings.business.trade} ${city}`
    ]});
    const keywords = U.keywordsFormat(keywordsList);
    return R.mergeDeepRight(context, {
        ...cityMaker,
        heroImg,
        contentImg,
        id,
        paths,
        absolutePath,
        pageTitle,
        filename,
        cityRegionList,
        schema,
        regionFooterHeading,
        regionFooterUl,
        mobileBreadcrumbs,
        footerBreadcrumbs,
        keywords,
        keywordsList
    });
};

const cityRegion = context => {
    const {
        input: { cityRegion },
        trade,
        Trade,
        industry,
        Industry,
        Australia,
        Sydney,
        sydney,
        NSW,
        nsw,
        keywordsList: keywordsList_
    } = context;
    const nameMaker = contextMaker("", cityRegion);
    const cityRegionMaker = contextMaker("region", cityRegion);
    const id = U.id("sydney");
    const RegionNoThe = nameMaker.NameNoThe;
    const filename = U.filenameFormat(cityRegion);
    const segment = `${trade}-${industry}`;
    const rel = [segment, sydney, U.filenameFormat(cityRegion)];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { segment, rel, path, pretty, output, domain };
    const absolutePath = domain;
    const pageTitle = `${Trade}ing a ${Industry} Business in ${
        nameMaker.NameThe
    }`;
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [
            `${Trade}ing ${
                buySell === "Buy" ? "a" : "your"
            } ${Industry} Business`,
            `${paths.segment}/index.html`
        ],
        [
            `${Trade}ing a ${Industry} Business in ${Sydney}`,
            `${paths.segment}/${sydney.toLowerCase()}/index.html`
        ],
        [pageTitle, paths.pretty]
    ]);
    const cityRegionSuburbsList = U.removeAllEmpty(
        U.fileToList(
            dataPaths.cityRegions.suburbs + `${U.filenameCase(cityRegion)}.txt`
        )
    );
    const cityRegionSuburbsSubset = R.take(
        Math.ceil(cityRegionSuburbsList.length * settings.subset),
        shuffleSeed.shuffle(cityRegionSuburbsList, cityRegion)
    );
    const cityRegionSuburbs = cityRegionSuburbsSubset;
    const regionFooterHeading = R.isEmpty(cityRegionSuburbs)
        ? ""
        : `<div class="regionFooterHeading">${Trade} a ${
              Industry
          } Business in one of ${nameMaker.NameThe}’s Suburbs:</div>`;
    const regionFooterUl = U.cityRegionFooterList(
        paths.segment,
        sydney,
        cityRegionSuburbs
    );
    const mobileBreadcrumbs = U.mobileBreadcrumbs([
        [Australia, `${paths.segment}/index.html`],
        [NSW, `${paths.segment}/${nsw}.html`],
        [Sydney, `${paths.segment}/${sydney}/index.html`]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [Australia, `${paths.segment}/index.html`],
        [Sydney, `${paths.segment}/${sydney.toLowerCase()}/index.html`],
        [changeCase.titleCase(cityRegion), ""]
    ]);
    const keywordsList = U.keywordsReducer({ seed: cityRegion, prev: keywordsList_, next: [
        `${cityRegion} ${settings.business.trade}`,
        `${settings.business.name} ${settings.business.trade} ${cityRegion}`
    ]});
    const keywords = U.keywordsFormat(keywordsList);
    return R.mergeDeepRight(context, {
        ...nameMaker,
        ...cityRegionMaker,
        cityRegionSuburbs,
        id,
        RegionNoThe,
        paths,
        absolutePath,
        pageTitle,
        schema,
        cityRegionSuburbs,
        regionFooterHeading,
        regionFooterUl,
        mobileBreadcrumbs,
        footerBreadcrumbs,
        keywordsList,
        keywords
    });
};

const suburb = context => {
    const {
        input: { name, suburb, buySell },
        parentContext,
        sydney,
        Sydney,
        trade,
        Trade,
        Industry,
        Australia,
        cityRegionSuburbs,
        keywordsList: keywordsList_,
        NSW,
        nsw,
        filenameregion,
        Region,
        industry
    } = context;
    const nameMaker = contextMaker("", suburb);
    const heroImg = "";
    const contentImg = "daycare-business-sydney.jpg";
    const id = U.id("suburb");
    const segment = `${trade}-${industry}`;
    const filename = U.filenameFormat(suburb);
    const rel = [segment, sydney, filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { segment, rel, path, pretty, output, domain };
    const absolutePath = domain;
    const pageTitle = `${Trade}ing a ${Industry} Business in ${changeCase.titleCase(
        name
    )}, ${parentContext.NameNoThe}`;
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [
            `${Trade}ing ${
                buySell === "Buy" ? "a" : "your"
            } ${Industry} Business`,
            `${paths.segment}/index.html`
        ],
        [
            `${Trade}ing a ${Industry} Business in ${Sydney}`,
            `${paths.segment}/${sydney.toLowerCase()}/index.html`
        ],
        [
            `${Trade}ing a ${Industry} Business in ${parentContext.nameThe}`,
            `${paths.segment}/sydney/${parentContext.filename}`
        ],
        [pageTitle, paths.pretty]
    ]);
    const nearbySuburbs = R.intersection(
        dataPaths.suburbs.nearby[suburb],
        cityRegionSuburbs
    );
    const nearbySuburbsHeading = R.isEmpty(nearbySuburbs)
        ? ""
        : `<div class="regionFooterHeading">${Trade}ing a ${Industry} Business in Nearby Suburbs:</div>`;
    const nearby = U.cityRegionFooterList(paths.segment, sydney, nearbySuburbs);
    const keywordsList = U.keywordsReducer({ seed: suburb, prev: keywordsList_, next: [
        `${suburb} ${settings.business.trade}`,
        `${settings.business.name} ${settings.business.trade} ${suburb}`
    ]});
    const keywords = U.keywordsFormat(keywordsList);
    const mobileBreadcrumbs = U.mobileBreadcrumbs([
        [Australia, `${paths.segment}/index.html`],
        [NSW, `${paths.segment}/${nsw}.html`],
        [Sydney, `${paths.segment}/${sydney}/index.html`],
        [Region, `${paths.segment}/sydney/${filenameregion}.html`]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [Australia, `${paths.segment}/index.html`],
        [Sydney, `${paths.segment}/${sydney}/index.html`],
        [Region, `${paths.segment}/sydney/${filenameregion}.html`],
        [changeCase.titleCase(name), ""]
    ]);
    return R.mergeDeepRight(context, {
        ...nameMaker,
        heroImg,
        contentImg,
        id,
        paths,
        absolutePath,
        pageTitle,
        schema,
        nearbySuburbs,
        nearbySuburbsHeading,
        nearby,
        keywords,
        keywordsList,
        mobileBreadcrumbs,
        footerBreadcrumbs
    });
};

const directory = context => {
    const {
        input: { buySell, footerType },
        industry,
        Industry,
        Australia,
        nsw,
        NSW,
        nswRegionList,
        keywordsList: keywordsList_,
        sydney,
        Sydney
    } = context;
    const nameMaker = contextMaker("", "directory");
    const title = "Directory";
    const filename = "directory.html";
    const rel = [filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { rel, path, pretty, output, domain };
    const absolutePath = paths.domain;
    const pageTitle = `Buy or Sell a ${Industry} Business in Australian Suburbs and Regions`;
    const schema = U.schema([
        [`Buy and Sell ${Industry} Businesses Across ${Australia}`, ""],
        [pageTitle, filename]
    ]);
    const footer = dataPaths.footer.template[footerType];
    const keywordsList = U.keywordsReducer({ seed: title, prev: keywordsList_, next: []});
    const keywords = U.keywordsFormat(keywordsList);
    const directoryList = dataPaths.buySell.data
        .map(buySell => {
            const directoryUl = s => `<ul id="directoryUl">${s}</ul>`;
            return (
                `<a href="${buySell.toLowerCase()}-${industry}/index.html"><h4>${buySell} ${Industry} in ${Australia}&nbsp;»</h4></a>` +
                `<a href="${buySell.toLowerCase()}-${industry}/${nsw.toLowerCase()}.html"><h5>${buySell} ${Industry} in ${NSW}&nbsp;»</h5></a>` +
                directoryUl(
                    nswRegionList
                        .map(stateRegion => {
                            return `<li><a href="/${buySell.toLowerCase()}-${industry}/${U.filenameFormat(
                                stateRegion
                            )}">${buySell} a ${Industry} Business in <strong>${stateRegion}</strong>&nbsp;»</a></li>`;
                        })
                        .join("")
                ) +
                `<a href="${buySell.toLowerCase()}-${industry}/${sydney}/index.html"><h6>${buySell} ${Industry} in ${Sydney}&nbsp;»</h6></a>` +
                U.removeAllEmpty(U.fileToList(dataPaths.cityRegions.data))
                    .map(cityRegion => {
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
                        };
                        return (
                            `<a href="/${buySell.toLowerCase()}-${industry}/${sydney}/${U.filenameFormat(
                                cityRegion
                            )}"><h6 class="h7">${buySell} a ${Industry} Business in ${changeCase.titleCase(
                                cityRegion
                            )}&nbsp;»</h6></a>` +
                            directoryUl(
                                cityRegionSuburbs()
                                    .map(suburb => {
                                        return `<li><a href="/${buySell.toLowerCase()}-${industry}/${sydney}/${U.filenameFormat(
                                            suburb
                                        )}">${buySell} a ${Industry} Business in <strong>${changeCase.titleCase(
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
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [changeCase.titleCase(nameMaker.name), ""]
    ]);
    const description = U.description("A list of the areas - national, state and local - that we service with childcare business sales and acquisitions.");
    return R.mergeDeepRight(context, {
        ...nameMaker,
        title,
        filename,
        paths,
        absolutePath,
        pageTitle,
        schema,
        footer,
        keywords,
        keywordsList,
        directoryList,
        footerBreadcrumbs,
        description
    });
};

module.exports = {
    contextItem,
    contextMaker,
    general,
    buySell,
    industry,
    home,
    about,
    contact,
    country,
    state,
    stateRegion,
    city,
    cityRegion,
    suburb,
    directory
};
