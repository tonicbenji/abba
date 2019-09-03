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

const general = ({ name, pageType, footerType }) => {
    return {
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
    };
};

const buySell = ({ buySell }) => {
    return {
        ...contextMaker("buySell", buySell),
        ...contextMaker("trade", buySell),
        buySellFilename: U.filenameFormat(buySell)
    };
};

const industry = ({ buySell, industry }) => {
    return {
        ...contextMaker("industry", industry),
        keywordLists: {
            industry: [
                `${buySell} ${industry}`,
                `${buySell} ${industry} Business`,
                `${buySell} preschool`,
                `${buySell} mergers`,
                `${buySell} acquisitions`,
                `${buySell} ${settings.business.trade}`
            ]
        }
    };
};

const home = () => {
    return {
        title: "Buy and Sell Childcare Businesses across Australia",
        get home() {
            return this.title;
        },
        filename: "index.html",
        footerBreadcrumbs: "",
        id: U.id("home"),
        description: U.description("The Abba Group are Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity.")
    };
};

const about = ({ about }) => {
    return {
        title: about,
        filename: U.filenameFormat(about),
        id: U.id("about"),
        description: U.description("About Abba Group - Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity.")
    };
};

const contact = ({ contact }) => {
    return {
        title: contact,
        filename: U.filenameFormat(contact),
        id: U.id("contact"),
        description: U.description("Contact Abba Group - Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity.")
    };
};

const country = ({ country, buySell }) => {
    return {
        ...contextMaker("", country),
        filename: "index.html",
        heroImg: "",
        contentImg: "childcare-businesses-sydney.jpg",
        id: U.id("aus"),
        keywordLists: {
            country: [
                `${country} ${settings.business.trade}`,
                `${settings.business.name} ${
                    settings.business.trade
                } ${country}`
            ]
        },
        description: U.description(buySell === "Buy" ? "In addition to analysing the accounts of a business you are considering for purchase and to ensure that it is making a steady profit, you should also ensure that it has a high occupancy rate – 80% or higher." : "In large cities like Sydney, Brisbane and Melbourne there is currently an oversupply of childcare placements. In some suburbs within these cities and in less metropolitan areas there is however, actually an undersupply.")
    };
};

const state = ({ state, buySell }) => {
    return {
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
        filename: "nsw.html",
        description: U.description(buySell === "Buy" ? "Reports published by the Australian government indicate that the supply of childcare is constrained by several factors in NSW, and this means that many buyers are fighting over a limited number of childcare businesses." : "There are many opportunities at present within the NSW childcare business market. In June 2018, the Australian Government announced that it is extending the childcare subsidy to children as young as three years.")
    };
};

const stateRegion = ({ stateRegion }) => {
    return {
        ...contextMaker("", stateRegion),
        ...contextMaker("region", stateRegion),
        filename: U.filenameFormat(stateRegion),
        heroImg: "childcare-business-nsw.jpg",
        contentImg: "preschool-business-nsw.jpg",
        id: U.id("nswRegion"),
        description: U.description(buySell === "Buy" ? `Reports published by the Australian government indicate that the supply of childcare is constrained by several factors in ${U.theToLower(changeCase.titleCase(stateRegion))}, and this means that many buyers are fighting over a limited number of childcare businesses.` : `Among the broader regulatory factors affecting the childcare business market in ${U.theToLower(changeCase.titleCase(stateRegion))} is the Australian Government’s announcement that it is extending the childcare subsidy.`)
    };
};

const city = ({ city, buySell }) => {
    return {
        ...contextMaker("", city),
        filename: "index.html",
        cityRegionList: U.removeAllEmpty(
            U.fileToList(dataPaths.cityRegions.data)
        ),
        heroImg: "childcare-business-sydney.jpg",
        contentImg: "sydney-childcare-business-little-kid.jpg",
        id: U.id("sydney"),
        description: U.description(buySell === "Buy" ? "When buying an independent centre in Sydney, you have more freedom and potentially higher profit margins, whereas with a franchise you have more guidance and potentially lower risk." : "As you are probably well aware, Sydney does have an oversupply of childcare businesses. This oversupply is worse in some areas than others.")
    };
};

const cityRegion = ({ cityRegion, buySell }) => {
    return {
        ...contextMaker("", cityRegion),
        ...contextMaker("region", cityRegion),
        cityRegionSuburbs: dataPaths.suburbs.nearby[cityRegion],
        id: U.id("sydney"),
        description: U.description(buySell === "Buy" ? `When buying an independent centre in ${U.theToLower(changeCase.titleCase(cityRegion))}, you have more freedom and potentially higher profit margins, whereas with a franchise you have more guidance and potentially lower risk.` : `As you are probably well aware, ${U.theToLower(changeCase.titleCase(cityRegion))} does have an oversupply of childcare businesses. This oversupply is worse in some areas than others.`)
    };
};

const suburb = ({ suburb, buySell }) => {
    return {
        ...contextMaker("", suburb),
        heroImg: "",
        contentImg: "daycare-business-sydney.jpg",
        id: U.id("suburb"),
        description: U.description(buySell === "Buy" ? `While there is a strong demand for childcare in ${U.theToLower(changeCase.titleCase(suburb))}, you should be aware of some local conditions and broader regulations that will affect your purchase.` : `There is strong variation within the ${U.theToLower(changeCase.titleCase(suburb))} area, and this is one of the largest factors in the selling price of your childcare business.`)
    };
};

const directory = () => {
    return {
        ...contextMaker("", "directory"),
        title: "Directory",
        filename: "directory.html",
        description: U.description("A list of the areas - national, state and local - that we service with childcare business sales and acquisitions.")
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
