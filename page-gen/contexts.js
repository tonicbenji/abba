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
        filename: U.filenameFormat(value)
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

const general = ({ name, pageType, footerType }) => {
    return {
        ...components({ footerType }),
        ...contextMaker("businessName", settings.business.name),
        ...contextMaker("", name),
        nameNoThe: U.noThe(name.toLowerCase()),
        NameNoThe: U.noThe(changeCase.titleCase(name)),
        NAMENOTHE: U.noThe(name.toUpperCase()),
        domain: settings.domain
    };
};

const buySell = ({ buySell }) => {
    return {
        ...contextMaker("buySell", buySell),
        ...contextMaker("trade", buySell),
        buySellFilename: U.filenameFormat(buySell)
    };
};

const industry = ({ industry }) => contextMaker("industry", industry);

const home = () => {
    return {
        title: "Buy and Sell Childcare Businesses across Australia",
        get home() {
            return this.title;
        },
        filename: "index.html",
        keywords: {
            home: [""]
        },
        footerBreadcrumbs: ""
    };
};

const about = ({ about }) => {
    return {
        title: about,
        filename: U.filenameFormat(about),
    };
};

const contact = ({ contact }) => {
    return {
        title: contact,
        filename: U.filenameFormat(contact)
    };
};

const country = ({ country }) => {
    return {
        ...contextMaker("", country),
        filename: "index.html",
        keywords: {
            country: [`${country} ${settings.business.trade}`]
        }
    };
};

const state = ({ state }) => {
    return {
        ...contextMaker("", state),
        ...contextMaker(state, state),
        nswRegionList: U.removeAllEmpty(U.fileToList(dataPaths.stateRegions.data)),
        get id() {
            return U.id(this.name);
        }
    }
}

const stateRegion = ({ stateRegion }) => {
    return {
        ...contextMaker("", stateRegion),
        ...contextMaker("region", stateRegion),
        filename: U.filenameFormat(stateRegion)
    };
};

const city = ({ city }) => {
    return {
        ...contextMaker("", city),
        filename: "index.html",
        cityRegionList: U.removeAllEmpty(U.fileToList(dataPaths.cityRegions.data)),
        get id() {
            return U.id(this.name);
        }
    };
};

const cityRegion = ({ cityRegion }) => {
    return {
        ...contextMaker("", cityRegion),
        ...contextMaker("region", cityRegion)
    };
};

const suburb = ({ suburb }) => {
    return {
        ...contextMaker("", suburb),
        nearby: dataPaths.suburbs.nearby[suburb]
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
    suburb
};
