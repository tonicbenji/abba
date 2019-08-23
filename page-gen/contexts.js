const R = require("ramda");
const changeCase = require('change-case')
const settings = require("./gen-config");
const U = require("./utilities");

const contextItem = (f, key, value) => {
    return {
        [f(key)]: f(value)
    }
}

const contextMaker = (key, value) => {
    const key_ = !R.isEmpty(key) ? key : value;
    return {
        ...contextItem(R.toLower, key_, value),
        ...contextItem(R.toUpper, key_, value),
        ...contextItem(changeCase.camelCase, key_, value),
        ...contextItem(changeCase.constantCase, key_, value),
        ...contextItem(R.toLower, "name", value),
        ...contextItem(R.toUpper, "name", value),
        ...contextItem(changeCase.camelCase, "name", value),
        ...contextItem(changeCase.constantCase, "name", value),
        filename: U.filenameFormat(value)
    }
}

const general = ({ name }) => {
    return {
        ...contextMaker("", settings.businessName),
        ...contextMaker("", name),
        // nameNoThe: U.noThe(name.toLowerCase()),
        // NameNoThe: U.noThe(U.titleCase(name)),
        // NAMENOTHE: U.noThe(name.toUpperCase()),
    };
};

const buySell = ({ buySell }) => {
    return {
        ...contextMaker("buySell", buySell),
        buySellFilename: U.filenameFormat(buySell)
    };
};

const industry = ({ industry }) => contextMaker("industry", industry);

const home = ({ home }) => {
    return {
        title: home,
        filename: "index.html"
    };
}

const about = ({ about }) => {
    return {
        title: about,
        filename: U.filenameFormat(about)
    };
}

const contact = ({ contact }) => {
    return {
        title: contact,
        filename: U.filenameFormat(contact)
    };
}


const country = ({ country }) => {
    return {
        ...contextMaker("", country),
        filename: "index.html"
    };
};

const state = ({ state }) => contextMaker("", state);

const stateRegion = ({ stateRegion }) => contextMaker("", stateRegion);

const city = ({ city }) => {
    return {
        ...contextMaker("", city),
        filename: "index.html"
    };
};

const cityRegion = ({ cityRegion }) => contextMaker("", cityRegion);

const suburb = ({ suburb }) => contextMaker("", suburb);

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
}
