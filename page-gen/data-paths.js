const U = require("./utilities");
const settings = require("./gen-config");

module.exports = {
    firstLevelPageTypes: [
        "home",
        "about",
        "contact",
        "country",
        "state",
        "state regions",
        "city",
        "city regions"
    ],
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
        template: "src/templates/suburb/",
        nearby: JSON.parse(U.readFile("src/locations/locations-cache.json"))
    },
    sitemap: {
        data: {
            header:
                '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            footer: "\n</urlset>"
        }
    },
    directory: {
        data: {
            header: "src/templates/directory/header.html",
            footer: "src/templates/directory/footer.html"
        }
    },
    components: {
        tagline: "Business Sales, Acquisitions and Mergers",
        description:
            '<meta name="description" content="The Abba Group are Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity">',
        formSubmittedMobile:
            '<div id="formSubmittedMobile">✓&nbsp;&nbsp; Thank you, we will be in touch shortly</div>',
        rootUrl: settings.rootUrl,
        menuItems: `
        <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home financity-normal-menu"><a href="/buy-childcare/index.html">Buy Childcare</a></li>
        <li class="menu-item menu-item-type-post_type menu-item-object-page financity-normal-menu"><a href="/sell-childcare/index.html">Sell Childcare</a></li>`,
        buttonBuy:
            '<a href="/buy-childcare/index.html" class="abbaButton abbaButton-buy">Buy a Childcare Business</a>',
        buttonSell:
            '<a href="/sell-childcare/index.html"  class="abbaButton abbaButton-sell">Sell a Childcare Business</a>',
        copyright: `<div class="abbaCopyright">© Abba Group Sydney ${U.year} | <a href="/directory.html">Sales, Mergers and Acquisitions Australia</a></div>`,
        footerHeadingBuy: '<div class="home-footer-heading-buy">Buy:</div>',
        footerHeadingSell: '<div class="home-footer-heading-sell">Sell:</div>',
        footerBuyNsw: '<ul class="home-footer-heading-nsw"><li><a href="/buy-childcare/nsw.html">NSW</a></li></ul>',
        footerSellNsw: '<ul class="home-footer-heading-nsw"><li><a href="/sell-childcare/nsw.html">NSW</a></li></ul>',
        regionFooterHeading: `<div class="regionFooterHeading">{{Trade}} a Childcare Business in one of NSW’s Regions:</div>`
    },
    footer: {
        template: {
            page:        U.fileToStr("src/templates/pages/footer.html"),
            state:       U.fileToStr("src/templates/nsw/footer.html"),
            stateRegion: U.fileToStr("src/templates/nswRegion/footer.html"),
            city:        U.fileToStr("src/templates/sydney/footer.html"),
            suburb:      U.fileToStr("src/templates/suburb/footer.html"),
            country:     "",
            home:        U.fileToStr("src/templates/home/footer.html")
        }
    }
};
