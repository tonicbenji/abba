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
    const { country } = context.input;
    return R.mergeDeepRight(context, {
        ...contextMaker("", country),
        filename: "index.html",
        heroImg: "",
        contentImg: "childcare-businesses-sydney.jpg",
        id: U.id("aus"),
        keywordsList: U.keywords2(country, [], [
            `${country} ${settings.business.trade}`,
            `${settings.business.name} ${
                settings.business.trade
            } ${country}`
        ])
    });
};

const state = context => {
    const { state } = context.input;
    return R.mergeDeepRight(context, {
        ...contextMaker("", state),
        ...contextMaker(state, state),
        nsw: state.toUpperCase(),
        Nsw: state.toUpperCase(),
        name: state.toUpperCase(),
        Name: state.toUpperCase(),
        nameThe: state.toUpperCase(),
        NameThe: state.toUpperCase(),
        nameNoThe: state.toUpperCase(),
        NameNoThe: state.toUpperCase(),
        nswRegionList: U.removeAllEmpty(
            U.fileToList(dataPaths.stateRegions.data)
        ),
        heroImg: "preschool-business-brokers-nsw-2.jpg",
        contentImg: "children-playing-nsw-childcare-businesses.jpg",
        id: U.id("nsw"),
        filename: "nsw.html"
    });
};

const stateRegion = ({ stateRegion }) => {
    return {
        ...contextMaker("", stateRegion),
        ...contextMaker("region", stateRegion),
        filename: U.filenameFormat(stateRegion),
        heroImg: "childcare-business-nsw.jpg",
        contentImg: "preschool-business-nsw.jpg",
        id: U.id("nswRegion")
    };
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
