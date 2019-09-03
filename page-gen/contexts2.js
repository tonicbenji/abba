const R = require("ramda");
const changeCase = require("change-case");
const settings = require("./gen-config");
const U = require("./utilities");
const dataPaths = require("./data-paths");

const contextItem = (f, key, value) => {
    return {
        [f(key)]: f(value)
    };
};

const contextMaker = (key, value) => {
    const key_ = !R.isEmpty(key) ? key : value;
    return {
        ...contextItem(R.toLower, key_, value),
        ...contextItem(R.toUpper, key_, value),
        ...contextItem(changeCase.titleCase, key_, value),
        ...contextItem(changeCase.camelCase, key_, value),
        ...contextItem(changeCase.constantCase, key_, value),
        ...contextItem(R.toLower, "name", value),
        ...contextItem(R.toUpper, "name", value),
        ...contextItem(changeCase.titleCase, "name", value),
        ...contextItem(changeCase.camelCase, key_, value),
        ...contextItem(changeCase.constantCase, "name", value),
        ...contextItem(U.filenameCase, `filename${key_}`, value),
        filename: U.filenameFormat(value),
        get nameThe() {
            return U.theToLower(this.Name);
        },
        get NameThe() {
            return this.Name;
        }
    };
};

const components = ({ footerType }) => {
    const path = "src/templates/components/";
    const files = ["bottomScripts", "contactForm", "header", "meta"];
    return {
        ...R.fromPairs(R.map(x => [x, U.fileToStr(path + `${x}.html`)], files)),
        footer: dataPaths.footer.template[footerType],
        ...dataPaths.components
    };
};


const general = context => {
    const { name, pageType, footerType } = context.input;
    return R.mergeDeepRight(context,
        {
            ...components({ footerType }),
            ...contextMaker("BusinessName", settings.business.name),
            BusinessName: changeCase.titleCase(settings.business.name),
            ...contextMaker("", name),
            nameNoThe: U.noThe(name.toLowerCase()),
            NameNoThe: U.noThe(changeCase.titleCase(name)),
            NAMENOTHE: U.noThe(name.toUpperCase()),
            domain: settings.domain,
            Domain: U.escForwardSlashes(settings.domain),
            mobileBreadcrumbs: ""
        }
    );
};

const buySell = context => {
    const { buySell } = context.input;
    return R.mergeDeepRight(context,
{
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
    const { industry, Industry, nswRegionList, Australia, keywordsList: keywordsList_ } = context;
    const title = "Buy and Sell Childcare Businesses across Australia"
    const filename = "index.html"
    const rel = [filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { rel, path, pretty, output, domain };
    const absolutePath = domain;
    const pageTitle = `Buy and Sell ${Industry} Businesses Across ${
        Australia
    }`;
    const schema = U.schema([[pageTitle, ""]]);
    const footerBuyNswRegions = nswRegionList ? U.nswRegionFooterList(
        `buy-${industry}`,
        nswRegionList
    ) : "";
    const footerSellNswRegions = nswRegionList ? U.nswRegionFooterList(
        `sell-${industry}`,
        nswRegionList
    ) : "";
    const description = U.description(
        "The Abba Group are Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity."
    );
    const id = U.id("home");
    const footerBreadcrumbs = "";
    const home = title;
    const keywordsList = keywordsList_ ? U.keywords2(title, keywordsList_, [
        "Buy a childcare business NSW",
        "Sell a childcare business NSW",
        "How to buy a childcare business NSW",
        "How to sell a childcare business NSW",
        "Childcare business acquisition NSW",
        "Childcare business merger NSW"
    ]) : [];
    const keywords = U.keywordsFormat(keywordsList);
    return R.mergeDeepRight(context,
        {
            title,
            home,
            filename,
            footerBreadcrumbs,
            id,
            paths,
            absolutePath,
            pageTitle,
            schema,
            footerBuyNswRegions,
            footerSellNswRegions,
            keywordsList,
            keywords,
            description
        });
};

const about = context => {
    const { input: { name }, Industry, Australia, keywords: keywords_ } = context;
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
        [
            `Buy and Sell ${Industry} Businesses Across ${
                Australia
            }`,
            ""
        ],
        [pageTitle, filename]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [title, filename]
    ]);
    const keywords = keywords_;
    return R.mergeDeepRight(context, {
        title,
        filename,
        id,
        paths,
        absolutePath,
        pageTitle,
        schema,
        footerBreadcrumbs,
        keywords
    });
};

const contact = context => {
    const { input: { name }, Industry, Australia, keywords: keywords_ } = context;
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
        [
            `Buy and Sell ${Industry} Businesses Across ${
                Australia
            }`,
            ""
        ],
        [pageTitle, filename]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [title, filename]
    ]);
    const keywords = keywords_;
    return R.mergeDeepRight(context, {
        title,
        filename,
        id,
        paths,
        absolutePath,
        pageTitle,
        schema,
        footerBreadcrumbs,
        keywords
    });
};

const country = context => {
    const { input: { country }, trade, Trade, industry, Industry, Australia, nswRegionList } = context;
    const title = country;
    const Title = changeCase.titleCase(country);
    const pageTitle = `${Trade}ing ${buySell === "Buy" ? "a" : "your"} ${
        Industry
    } Business`;
    const filename = "index.html";
    const rel = [filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { rel, path, pretty, output, domain };
    const absolutePath = domain;
    const heroImg = "";
    const contentImg = "childcare-businesses-sydney.jpg";
    const id = U.id("aus");
    const keywordsList = U.keywords2(country, [], [
        `${country} ${settings.business.trade}`,
        `${settings.business.name} ${
            settings.business.trade
        } ${country}`
    ]);
    const schema = U.schema([
        [
            `Buy and Sell ${Industry} Businesses Across ${
                Australia
            }`,
            ""
        ],
        [pageTitle, paths.pretty]
    ]);
    const footer = dataPaths.footer.template.country[trade];
    const footerBuyNswRegions = nswRegionList ? U.nswRegionFooterList(
        `buy-${industry}`,
        nswRegionList
    ) : [];
    const footerSellNswRegions = nswRegionList ? U.nswRegionFooterList(
        `sell-${industry}`,
        nswRegionList
    ) : [];
    const footerBreadcrumbs = U.footerBreadcrumbs([["Home", ""], [Title, ""]]);
    const keywords = keywordsList;
    return R.mergeDeepRight(context, {
        ...contextMaker("", country),
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
    const { input: { state }, Trade, Industry, Australia, keywordsList } = context;
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
    const rel = [filename];
    const path = R.prepend(settings.outputLocation, rel);
    const pretty = U.prettyPath(rel);
    const output = U.relPathList(path);
    const domain = settings.domain + pretty;
    const paths = { rel, path, pretty, output, domain };
    const absolutePath = domain;
    const heroImg = "preschool-business-brokers-nsw-2.jpg";
    const contentImg = "children-playing-nsw-childcare-businesses.jpg";
    const id = U.id("nsw");
    const pageTitle = `${Trade}ing a ${Industry} Business in ${
        nameThe
    }`
    const schema = U.schema([
        [
            `Buy and Sell ${Industry} Businesses Across ${
                Australia
            }`,
            ""
        ],
        [pageTitle, paths.pretty]
    ]);
    const regionFooterHeading = `<div class="regionFooterHeading">${Trade} a ${
        Industry
    } Business in one of ${NSW}’s Regions:</div>`;
    const regionFooterUl = nswRegionList ? U.nswRegionFooterList(
        paths.segment,
        nswRegionList
    ) : [];
    const mobileBreadcrumbs = U.mobileBreadcrumbs([
        [Australia, `${paths.segment}/index.html`]
    ]);
    const footerBreadcrumbs = U.footerBreadcrumbs([
        ["Home", ""],
        [Australia, `${paths.segment}/index.html`],
        [NSW, `${paths.segment}/${nsw}.html`]
    ]);
    const keywords = keywordsList;
    return R.mergeDeepRight(context, {
        ...contextMaker("", state),
        ...contextMaker(state, state),
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
        schema,
        regionFooterHeading,
        regionFooterUl,
        mobileBreadcrumbs,
        footerBreadcrumbs,
        keywords
    });
};

const stateRegion = context => {
    const { stateRegion } = context.input;
    return R.mergeDeepRight(context, {
        ...contextMaker("", stateRegion),
        ...contextMaker("region", stateRegion),
        filename: U.filenameFormat(stateRegion),
        heroImg: "childcare-business-nsw.jpg",
        contentImg: "preschool-business-nsw.jpg",
        id: U.id("nswRegion")
    });
};

const city = ({ city }) => {
    return {
        ...contextMaker("", city),
        filename: "index.html",
        cityRegionList: U.removeAllEmpty(
            U.fileToList(dataPaths.cityRegions.data)
        ),
        heroImg: "childcare-business-sydney.jpg",
        contentImg: "sydney-childcare-business-little-kid.jpg",
        id: U.id("sydney")
    };
};

const cityRegion = ({ cityRegion }) => {
    return {
        ...contextMaker("", cityRegion),
        ...contextMaker("region", cityRegion),
        cityRegionSuburbs: dataPaths.suburbs.nearby[cityRegion],
        id: U.id("sydney")
    };
};

const suburb = ({ suburb }) => {
    return {
        ...contextMaker("", suburb),
        heroImg: "",
        contentImg: "daycare-business-sydney.jpg",
        id: U.id("suburb")
    };
};

const directory = () => {
    return {
        ...contextMaker("", "directory"),
        title: "Directory",
        filename: "directory.html"
    };
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
