module.exports = {
    firstLevelPageTypes: ["home", "about", "contact", "country", "state", "state regions", "city", "city regions"],
    buySell: {
        data: ["Buy", "Sell"]
    },
    industry: {
        data: "childcare"
    },
    home: {
        data: "Buy and Sell Childcare Businesses across Australia",
        template: "src/templates/pages/home.html"
    },
    about: {
        data: "About Us",
        template: "src/templates/pages/about.html"
    },
    contact: {
        data: "Contact Us",
        template: "src/templates/pages/contact.html"
    },
    country: {
        data: "Australia",
        template: "src/templates/australia/"
    },
    state: {
        data: "NSW",
        template: "src/templates/nsw/"
    },
    stateRegions: {
        data: "src/nswRegions/nswRegions.txt",
        template: "src/templates/nsw/"
    },
    city: {
        data: "Sydney",
        template: "src/templates/sydney/"
    },
    cityRegions: {
        data: "src/regions/sydney.txt",
        template: "src/templates/sydney/"
    },
    suburbs: {
        data: "src/",
        template: "src/templates/suburb/"
    }
};
