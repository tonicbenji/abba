// Node Libraries ----------

const fs = require("fs");
const R = require("ramda");
const now = require("performance-now");
const program = require("commander");
const chalk = require('chalk');
const dateFormat = require('dateformat');
const shuffleSeed = require('shuffle-seed');

// Personal Settings ----------

// Change these manually to change the settings of this generator
const settings = {
    useDemos    : false,
    useBaseUrl  : true,
    rootUrl     : "",
    domain      : "https://abbachildcaresales.com.au/",
    suburbsFile : "wikipedia-suburbs",
    genSuburbs  : true,
    logFiles    : true
};

// Command line arguments ----------

program
    .option("-s, --suburbs", "Generate Suburbs")
    .option("-d, --demos", "Use demos")
    .option("-l, --log", "Log progress")
    .parse(process.argv);

// Data Sources ----------

// Read file into a string
const fileToStr = fileLoc => R.toString(fs.readFileSync(fileLoc));

// Defining some of the common paths for data
const srcLoc = "src/";
const templateLoc = "templates/";
const demo =
    settings.useDemos === true || program.demos === true ? "demo-" : "";
const keyLoc = srcLoc + "keywords/";

// Sourcing the main data
const suburbsStr = fileToStr(`${srcLoc}suburbs/${settings.suburbsFile}.txt`);
const outputLoc = "output/";
const regionsStr = fileToStr(`${srcLoc}regions/sydney.txt`);
const nswRegionsStr = fileToStr(`${srcLoc}nswRegions/nswRegions.txt`);
const tradeStr = fileToStr(`${srcLoc}trades.txt`);
const industriesStr = fileToStr(`${srcLoc}industries.txt`);
const locationsCache = fs.readFileSync(`${demo}locations-cache.json`);

// Sourcing the main templates
const metaTemplate = fileToStr(`${srcLoc}${templateLoc}components/meta.html`);
const headerTemplate = fileToStr(
    `${srcLoc}${templateLoc}components/header.html`
);
const bottomScripts = fileToStr(
    `${srcLoc}${templateLoc}components/bottomScripts.html`
);
const suburbsFooterTemplate = fileToStr(
    `${srcLoc}${templateLoc}suburb/footer.html`
);
const sydneyFooterTemplate = fileToStr(
    `${srcLoc}${templateLoc}sydney/footer.html`
);
const nswFooterTemplate = fileToStr(`${srcLoc}${templateLoc}nsw/footer.html`);
const nswRegionFooterTemplate = fileToStr(
    `${srcLoc}${templateLoc}nswRegion/footer.html`
);
const pagesFooterTemplate = fileToStr(
    `${srcLoc}${templateLoc}pages/footer.html`
);
const homeFooterTemplate = fileToStr(`${srcLoc}${templateLoc}home/footer.html`);
const homeTemplate = fileToStr(`${srcLoc}${templateLoc}pages/home.html`);
const aboutTemplate = fileToStr(`${srcLoc}${templateLoc}pages/about.html`);
const contactTemplate = fileToStr(`${srcLoc}${templateLoc}pages/contact.html`);
const directoryTemplate = fileToStr(
    `${srcLoc}${templateLoc}directory/directory.html`
);
const websiteSummaryTemplate = fileToStr(
    `${srcLoc}${templateLoc}websiteSummary/website-summary.html`
);
const contactForm = fileToStr(
    `${srcLoc}${templateLoc}components/contactForm.html`
);

// Defining some of the generic data that gets inserted into the output
const consoleIndent = "    ";
const tagline = "Business Sales, Acquisitions and Mergers";
const description =
    "<meta name=\"description\" content=\"The Abba Group are Australia’s fastest growing business brokerage. Our greatest prides are in our trailblazing track record, and our integrity\">";
const businessName = "Abba Group";
const formSubmittedMobile =
    "<div id=\"formSubmittedMobile\">✓&nbsp;&nbsp; Thank you, we will be in touch shortly</div>";

// Defining some of the home menu data
const homeMenuBuy =
    "<li  class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-home financity-normal-menu\"><a href=\"/buy-childcare/index.html\">Buy Childcare</a></li>";
const homeMenuSell =
    "<li  class=\"menu-item menu-item-type-post_type menu-item-object-page financity-normal-menu\"><a href=\"/sell-childcare/index.html\">Sell Childcare</a></li>";

// Defining the sitemap stream
const sitemapFile = `${outputLoc}sitemap.xml`;
const sitemapStream = fs.createWriteStream(sitemapFile);
const sitemapHeader =
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">";
const sitemapFooter = "\n</urlset>";

// Defining some mutable variables so that they can be referenced in functions before they are used in the output loop
var trade = (Trade = industry = Industry = directoryList = "");
var n = 0;

// Logging ----------

// console.log shorthand
const cl = (...args) => {
    if (settings.logFiles || program.log) {
        console.log(...args);
    }
};

// Returns equals signs repeated. To be used as the separator decoration in the console log output
const eqSep = num => "=".repeat(num);

const eq5 = eqSep(5);

// Console logs a string and adds a stylistic separator to indicate that it is a section heading
const logSection = name => cl("\n" + chalk.cyan(eq5) + " " + chalk.bold.yellow(name) + " " + chalk.cyan(eq5));

// Console logs the name of a page being generated, along with the number of how many pages have been generated
const logPage = (num, content) => cl(chalk.blue(`${num}. `) + chalk.magenta('Wrote: ') + content);

// Utilities ----------

// Replace spaces with hyphens in a string
const spacesToHyphens = str => R.replace(/\s/g, "-", str);

// Convert string to titlecase
const toTitleCase = str => {
    return str.toLowerCase().replace(/^(.)|[\s-](.)/g, $1 => {
        return $1.toUpperCase();
    });
};

// Wrap a string in list tags
const toLi = str => "<li>" + str + "</li>";

// Append a linebreak to a string
const addLinebreak = str => str + "\n";

// Format a name into a filename
const filenameMake = name => R.toLower(spacesToHyphens(name) + ".html");

// Get a random item from an array of suburbs
ranItem = arr => {
    return arr[Math.floor(Math.random() * arr.length)];
};

// Converts a string to an array
const strToArr = str =>
    R.pipe(
        R.split("\n"),
        R.filter(
            R.compose(
                R.not,
                R.isEmpty
            )
        )
    )(str);

// Converts an array to a list
const arrToList = arr =>
    R.pipe(
        R.toString,
        R.replace(/,/g, ", "),
        R.trim
    )(arr);

// Convert an array to a string separated by commas
const arrToCommas = arr =>
    R.pipe(
        R.toString,
        R.replace(/"|'/g, ""),
        R.replace(/\[|\]/g, "\""),
        R.replace(/,/g, ", "),
        R.replace(/ {2}/g, " "),
        R.replace(/\\/g, "\""),
        R.trim
    )(arr);

// Concatenate all strings in a list
const arrToStr = strings => R.reduce(R.concat, "", strings);

// // Array shuffle (Knuth Fisher-Yates shuffle)
// const shuffle = arr => {
//     var j, x, i;
//     for (i = arr.length - 1; i > 0; i--) {
//         j = Math.floor(Math.random() * (i + 1));
//         x = arr[i];
//         arr[i] = arr[j];
//         arr[j] = x;
//     }
//     return arr;
// };

// Convert an array into a comma-separated string
const joinCommaseparated = arr => R.join(", ", arr);

// Create a function that replaces a template 'moustache/handlebars' tag with a string. (R.replace is curried)

const filter = (a, b) => R.replace(new RegExp("{{" + a + "}}", "g"), b);

// Escape all forward slashes in a string

const escForwardSlashes = str => R.replace(/\//g, "\\/", str);

// Data format conversions ----------

// Converting some of the source strings into arrays
const suburbs = strToArr(suburbsStr);
const trades = strToArr(tradeStr);
const industries = strToArr(industriesStr);
const regions = strToArr(regionsStr);
const nswRegions = strToArr(nswRegionsStr);

// Keywords ----------

// Get key file as a string
const getKeyFile = name => fileToStr(keyLoc + name + ".txt");

// Key file string to array
const getKeyArr = name => strToArr(getKeyFile(name));

// Shuffle keyword string and get the first 8 of the shuffled list
const keyArrShuffle = (arr, seed) => R.take(8, shuffleSeed.shuffle(arr, seed));

// Create the keyword filter for the output
const keyStrMake = (replaced, replacer, currentTrade, arr) => {
    return R.pipe(
        filter("Trade", currentTrade),
        filter(replaced, replacer)
    )(arrToCommas(arr));
};

// Get each keyword array
const generalKeyArrAll = getKeyArr("general-all");
const generalKeyArrTrade = getKeyArr("general-trade");
const ausKeyArr = getKeyArr("australia");
const childcareKeyArrAll = getKeyArr("childcare-all");
const childcareKeyArrTrade = getKeyArr("childcare-trade");
const nswTradeKeyArr = getKeyArr("nsw-trade");
const nswRegionTradeKeyArr = getKeyArr("nswRegion-trade");
const sydneyTradeKeyArr = getKeyArr("sydney-trade");
const suburbTradeKeyArr = getKeyArr("suburb-trade");

// Build up the final keyword arrays from the basic set
const ausKeyArrAll = R.concat(
    R.concat(generalKeyArrAll, ausKeyArr),
    childcareKeyArrAll
);
const ausKeyArrTrade = R.concat(
    R.concat(generalKeyArrTrade, ausKeyArr),
    childcareKeyArrTrade
);
const nswKeyArrTrade = R.concat(ausKeyArrTrade, nswTradeKeyArr);
const nswRegionKeyArrTrade = R.concat(nswKeyArrTrade, nswRegionTradeKeyArr);
const sydKeyArrTrade = R.concat(ausKeyArrTrade, sydneyTradeKeyArr);
const suburbKeyArrTrade = R.concat(sydKeyArrTrade, suburbTradeKeyArr);

// Compose the keyword functions
const keyMake = (replaced, replacer, currentTrade, arr) => {
    return keyStrMake(
        replaced,
        replacer,
        currentTrade,
        arrToCommas(keyArrShuffle(arr, currentTrade))
    );
};

// Filters ----------

// Make the html id attribute
idMake = id => `id="${id}"`;

// Filters for the output that apply to most outputs
const generalFilters = outputTemplate =>
    R.pipe(
        // Templates
        filter("header", headerTemplate),
        filter("meta", metaTemplate),
        filter("bottomScripts", bottomScripts),
        filter("contactForm", contactForm),
        // Single filters
        filter("rootUrl", settings.rootUrl),
        filter("domain", settings.domain),
        filter("Domain", escForwardSlashes(settings.domain)),
        filter("description", description),
        filter("businessName", businessName),
        filter("BusinessName", toTitleCase(businessName)),
        filter("tagline", tagline),
        filter("breadcrumbSeparator", breadcrumbSeparator),
        filter("formSubmittedMobile", formSubmittedMobile)
    )(outputTemplate);

// Takes an output template and an object of values that get inserted into that template
const areaFiltersMake = (obj, output) =>
    R.pipe(
        // Templates
        filter("footer", obj.footer),
        // Single filters
        filter("trade", obj.trade),
        filter("Trade", obj.Trade),
        filter("industry", obj.industry),
        filter("Industry", obj.Industry),
        filter("name", obj.name),
        filter("Name", obj.Name),
        filter("NameThe", toTitleCase(obj.Name)),
        filter("NameNoThe", noThe(obj.Name)),
        filter("id", idMake(obj.id)),
        filter("schema", obj.schema),
        filter("keywords", obj.keywords),
        filter("menuItems", obj.menuItems),
        filter("mobileBreadcrumbs", obj.mobileBreadcrumbs),
        filter("footerBreadcrumbs", obj.footerBreadcrumbs),
        filter("heroImg", obj.heroImg),
        filter("contentImg", obj.contentImg),
        filter("copyright", obj.copyright)
    )(output);

// Filters that apply specifically to the home page and Australia pages output
const homeFooterFiltersMake = (industry, output) =>
    R.pipe(
        filter(
            "footerHeadingBuy",
            "<div class=\"home-footer-heading-buy\">Buy:</div>"
        ),
        filter(
            "footerHeadingSell",
            "<div class=\"home-footer-heading-sell\">Sell:</div>"
        ),
        filter(
            "footerBuyNsw",
            "<ul class=\"home-footer-heading-nsw\"><li><a href=\"/buy-childcare/nsw.html\">NSW</a></li></ul>"
        ),
        filter(
            "footerSellNsw",
            "<ul class=\"home-footer-heading-nsw\"><li><a href=\"/sell-childcare/nsw.html\">NSW</a></li></ul>"
        ),
        filter("footerBuyNswRegions", nswRegionUl("Buy", industry)),
        filter("footerSellNswRegions", nswRegionUl("Sell", industry))
    )(output);

// Footer ----------

// Convert array of areas to a html unordered list of links to those areas
var arrToLinks = (path, arr) =>
    R.map(
        x =>
            "<li><a href='/" +
            R.toLower(path + noThe(filenameMake(x))) +
            "'>" +
            toTitleCase(x) +
            " »</a></li>",
        arr
    ).join(" ");

// Wrap a string in a html unordered list with an ID attribute
var addUl = (id, html) =>
    `<ul ${id === true ? `id="${id}"` : ""}>` + html + "</ul>";

// Make the footer unordered list by composing the previous footer functions
var footerUl = (id, path, arr) => addUl(id, arrToLinks(path, arr));

// Make the unordered list for the NSW Region pages specifically
var nswRegionUl = (theTrade, theIndustry) =>
    addUl(
        "",
        `<li><a href="/${R.toLower(
            theTrade
        )}-childcare/sydney/index.html">Sydney »</a></li>` +
            arrToLinks(
                `${R.toLower(theTrade)}-${R.toLower(theIndustry)}/`,
                nswRegions
            )
    );

// Date and Time ----------

// Define the components of today's date in the necessary formats
const todayDate = new Date();
const yyyy = dateFormat(todayDate, "yyyy");
const today = dateFormat(todayDate, "yyyy-mm-dd");
const time = dateFormat(todayDate, "hh:MM");

// Copyright footer ----------

// Make the copyright line in the footer. It requires the current year
const copyright = `<div class="abbaCopyright">© Abba Group Sydney ${
    yyyy
} | <a href="/directory.html">Sales, Mergers and Acquisitions Australia</a></div>`;

// Footer Lists ----------

// Build an array out of random suburbs
const ranArr = arr => {
    var randomArray = [];
    const maxLength = R.min(arr.length, 8);
    while (randomArray.length < maxLength) {
        var ranArea = ranItem(arr);
        if (randomArray.indexOf(ranArea) > -1) continue;
        randomArray[randomArray.length] = ranArea;
    }
    return randomArray;
};

// Breadcrumb schema data ----------

// Convert multiple arguments into a comma-separated string and wrap it in the schema markup
const schemaMaker = data => {
    return `<script type="application/ld+json">
        {
        "@context": "http://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [${joinCommaseparated(R.flatten([data]))}]
    }
        </script>`;
};

// Make a single schema ListItem
const schemaItemMaker = (path, name, itemNum) => {
    return `{
    "@type": "ListItem",
        "position": ${itemNum},
        "item":
    {
    "@id": "${settings.domain + path}",
        "name": "${name}"
}
}`;
};

const schemaHome = schemaItemMaker("index.html", "Home", 1);
const schemaAus = path => schemaItemMaker(`${path}index.html`, "Australia", 2);
const schemaNsw = path => schemaItemMaker(`${path}nsw.html`, "NSW", 3);
const schemaHomeAus = path => [`${schemaHome}`, schemaAus(path)];
const schemaHomeAusNsw = path => [`${schemaHomeAus(path)}`, schemaNsw(path)];
const schemaNswRegion = (path, region) =>
    schemaItemMaker(`${path}${filenameMake(region)}`, region, 4);
const schemaHomeAusNswNswRegion = (path, nswRegion) => [
    `${schemaHomeAusNsw(path)}`,
    schemaNswRegion(path, nswRegion)
];
const schemaSyd = path =>
    schemaItemMaker(`${path}sydney/index.html`, "Sydney", 3);
const schemaHomeAusSyd = path => [`${schemaHomeAus(path)}`, schemaSyd(path)];
const schemaSydRegion = (path, region) =>
    schemaItemMaker(`${path}sydney/${filenameMake(region)}`, region, 4);
const schemaHomeAusSydSydRegion = (path, region) => [
    `${schemaHomeAusSyd(path)}`,
    schemaSydRegion(path, region)
];
const schemaSuburb = (path, suburb) =>
    schemaItemMaker(path + "sydney/" + filenameMake(suburb), suburb, 5);
const schemaHomeAusSydSydRegionSuburb = (path, region, suburb) => [
    `${schemaHomeAusSydSydRegion(path, region)}`,
    schemaSuburb(path, suburb)
];
const schemaAbout = schemaItemMaker("/about-us.html", "About Us", 2);
const schemaHomeAbout = [schemaHome, schemaAbout];
const schemaContact = schemaItemMaker("/contact-us.html", "Contact Us", 2);
const schemaHomeContact = [schemaHome, schemaContact];
const schemaDirectory = schemaItemMaker("/directory.html", "Directory", 2);
const schemaHomeDirectory = [schemaHome, schemaDirectory];

// Sitemap ----------

// Write the sitemap header
sitemapStream.write(sitemapHeader);

// The template for each individual sitemap entry
const sitemapTemplate = (indent, loc, lastmod) => `
${indent}<url>
    ${indent}<loc>${loc}</loc>
    ${indent}<lastmod>${lastmod}</lastmod>
${indent}</url>`;

// The maker for each individual sitemap entry
var sitemapItem = filePath =>
    sitemapTemplate(consoleIndent, settings.domain + filePath, today);

// Nearby suburbs ----------

// Get the nearby suburbs array for a particular suburb from the JSON file of nearby suburbs
const getNearbyArr = (suburbStr, json) => {
    return R.prop(suburbStr, R.find(R.prop(suburbStr))(JSON.parse(json)));
};

// Modifying 'the' in the title of a suburb ----------

// Make 'The' lowercase
const theToLower = str => R.replace(/The/g, "the", str);

// Remove 'the ' or 'the-' in strings
const noThe = str =>
    R.pipe(
        R.replace(/the /g, ""),
        R.replace(/the-/g, ""),
        R.replace(/The /g, ""),
        R.replace(/The-/g, "")
    )(str);

// Templates ----------

// Get a template as a string
const templateGet = (dirName, fileName) =>
    fileToStr(srcLoc + templateLoc + dirName + "/" + fileName + ".html");

// Footer breadcrumbs ----------

// Defining some of the footer breadcrumbs data
const breadcrumbSeparator =
    "<span class=\"select-breadcrumb-separator\"><span class=\"fa fa-angle-right\"></span></span>";
const footerBreadcrumbsOpen =
    "<span class=\"footerBreadcrumbs text-center block\">";
const footerBreadcrumbsClose = "</span>";
const footerBreadcrumbsSeparator =
    "<span class=\"fa fa-angle-right footerSeparator\"></span>";
const homeFooterBreadcrumb = "<a class=\"nowrap\" href=\"/index.html\">Home</a>";

// Make a single breadcrumb 'a href' link html tag
const breadcrumbMakerGeneral = (path, name, arrow) =>
    `<a class="nowrap" href="/${path}">${arrow}${name}</a>`;

const breadcrumbMaker = (path, name, arrow) =>
    breadcrumbMakerGeneral(`${path}index.html`, name, arrow);

footerBreadcrumbsOpener = content =>
    R.prepend(footerBreadcrumbsOpen + homeFooterBreadcrumb, content);
footerBreadcrumbsCloser = content => R.append(footerBreadcrumbsClose, content);

footerBreadcrumbsSeparate = arr =>
    R.intersperse(footerBreadcrumbsSeparator, arr);

footerBreadcrumbsMake = arr =>
    R.pipe(
        footerBreadcrumbsOpener,
        footerBreadcrumbsSeparate,
        footerBreadcrumbsCloser,
        arrToStr
    )(arr);

// Output ----------

// Loop structure:

// * FOR Trades
//     * FOR Industries
//         * NSW Page
//         * FOR NSW Regions
//         * Sydney Page
//         * FOR Sydney Regions
//             * FOR Suburbs
//         * Australia Page
//     * Home Page
//     * About Us Page
//     * Contact Us Page

// Start performance timer
const startTime = now();

// Decorative linebreak
console.log("");

(() => {
    // Trades --------------------
    for (a = 0; a < trades.length; a++) {
        const trade = R.toLower(trades[a]);
        const Trade = toTitleCase(trades[a]);
        const ausTemplate = templateGet("australia", trade);
        const nswTemplate = templateGet("nsw", trade);
        const sydneyTemplate = templateGet("sydney", trade);
        const suburbsTemplate = templateGet("suburb", trade);

        // Industries --------------------
        for (b = 0; b < industries.length; b++) {
            var industry = R.toLower(industries[b]);
            var Industry = toTitleCase(industries[b]);
            const tradeIndPath = R.toLower(`${trade}-${industry}/`);
            const suburbPath = `${tradeIndPath}sydney/`;
            const nswPath = `${tradeIndPath}nsw.html`;

            // Breadcrumbs

            const australiaMobileBreadcrumb = breadcrumbMaker(
                tradeIndPath,
                "Australia",
                "« "
            );

            const sydneyMobileBreadcrumb = breadcrumbMaker(
                suburbPath,
                "Sydney",
                "« "
            );

            const nswMobileBreadcrumb = breadcrumbMaker(nswPath, "NSW", "« ");

            const ausFooterBreadcrumb = breadcrumbMaker(
                tradeIndPath,
                "Australia",
                ""
            );

            const nswFooterBreadcrumb = breadcrumbMaker(
                tradeIndPath,
                "NSW",
                ""
            );
            const sydFooterBreadcrumb = breadcrumbMaker(
                suburbPath,
                "Sydney",
                ""
            );

            const suburbMobileBreadcrumbs = `
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home">${australiaMobileBreadcrumb}</li>
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home">${sydneyMobileBreadcrumb}</li>
`;
            directoryList += `<a href="/${R.toLower(
                trade
            )}-childcare/index.html"><h4>${Trade} ${Industry} in Australia</h4></a>\n`;
            directoryList += `<a href="/${R.toLower(
                trade
            )}-childcare/nsw.html"><h5>${Trade} ${Industry} in NSW</h5></a>\n`;

            // Make NSW pages ----------

            logSection("NSW and NSW regions");

            const nsw = "nsw";
            const NSW = "NSW";

            const nswLoc = `${outputLoc}${R.toLower(trade)}-${R.toLower(
                industry
            )}`;
            const nswFilename = `${nswLoc}/nsw.html`;

            var schema = schemaMaker(schemaHomeAusNsw(tradeIndPath));

            const nswFooterBreadcrumbs = footerBreadcrumbsMake([
                ausFooterBreadcrumb,
                NSW
            ]);

            var areaFilters = output =>
                areaFiltersMake(
                    {
                        footer            : nswFooterTemplate,
                        trade             : trade,
                        Trade             : Trade,
                        industry          : industry,
                        Industry          : Industry,
                        name              : nsw,
                        Name              : NSW,
                        NameNoThe         : noThe(NSW),
                        id                : "nsw",
                        schema            : schema,
                        keywords          : keyMake("", "", Trade, nswKeyArrTrade),
                        menuItems         : homeMenuBuy + homeMenuSell,
                        mobileBreadcrumbs : "",
                        footerBreadcrumbs : nswFooterBreadcrumbs,
                        heroImg           : "preschool-business-brokers-nsw-2.jpg",
                        contentImg        :
                            "children-playing-nsw-childcare-businesses.jpg",
                        copyright         : copyright
                    },
                    output
                );

            const nswOutputFilters = outputTemplate =>
                R.pipe(
                    filter(
                        "regionFooterHeading",
                        `<div class="regionFooterHeading">${Trade} a Childcare Business in one of NSW’s Regions:</div>`
                    ),
                    filter("regionFooterUl", nswRegionUl(trade, industry))
                )(outputTemplate);

            const nswOutputFile = R.pipe(
                generalFilters,
                areaFilters,
                nswOutputFilters
            )(nswTemplate);

            fs.writeFileSync(nswFilename, nswOutputFile);

            logPage(n, `${trade} NSW index.html ${eq5}`);
            n++;

            // NSW regions ----------

            directoryList += "<ul id=\"directoryUl\">\n";

            for (c = 0; c < nswRegions.length; c++) {
                const nswRegion = R.toLower(nswRegions[c]);
                const NSWRegion = theToLower(nswRegions[c]);
                const nswRegionNoThe = noThe(nswRegion);
                const NSWRegionNoThe = toTitleCase(noThe(nswRegions[c]));
                const nswRegionFilename = filenameMake(nswRegionNoThe);

                var nswRegionLoc = `${outputLoc}${trade}-${industry}`;

                var nswRegionNameLoc = nswRegionLoc + `/${nswRegionFilename}`;

                var nswRegionNameLocSitemap = `${trade}-${industry}/${nswRegionFilename}`;

                var nswBreadcrumb = `<a href="/${trade}-childcare/nsw.html">NSW</a>`;

                const nswRegionFooterBreadcrumbs = footerBreadcrumbsMake([
                    ausFooterBreadcrumb,
                    nswFooterBreadcrumb,
                    toTitleCase(NSWRegion)
                ]);

                var nswRegionMobileBreadcrumbs =
                    `<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home">${australiaMobileBreadcrumb}</li>` +
                    "\n" +
                    `<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home">${nswMobileBreadcrumb}</li>`;

                var nswRegionMenuBreadcrumbs =
                    breadcrumbSeparator +
                    `<span class="menuItem"><a href="/${R.toLower(
                        trade
                    )}-childcare/nsw.html">NSW</a></span>`;

                var schema = schemaMaker(
                    schemaHomeAusNswNswRegion(tradeIndPath, nswRegionFilename)
                );

                var areaFilters = output =>
                    areaFiltersMake(
                        {
                            footer   : nswRegionFooterTemplate,
                            trade    : trade,
                            Trade    : Trade,
                            industry : industry,
                            Industry : Industry,
                            name     : nswRegion,
                            Name     : NSWRegion,
                            id       : "nswRegion",
                            schema   : schema,
                            keywords : keyMake(
                                "NSW",
                                NSWRegion,
                                Trade,
                                nswRegionKeyArrTrade
                            ),
                            menuItems         : homeMenuBuy + homeMenuSell,
                            mobileBreadcrumbs : nswRegionMobileBreadcrumbs,
                            footerBreadcrumbs : nswRegionFooterBreadcrumbs,
                            heroImg           : "childcare-business-nsw.jpg",
                            contentImg        : "preschool-business-nsw.jpg",
                            copyright         : copyright
                        },
                        output
                    );

                var nswRegionOutputFile = R.pipe(
                    generalFilters,
                    areaFilters
                )(nswTemplate);

                fs.writeFileSync(
                    R.toLower(nswRegionNameLoc),
                    nswRegionOutputFile
                );

                logPage(n, `${trade} ${spacesToHyphens(nswRegionNoThe)}.html`);
                n++;

                sitemapStream.write(sitemapItem(nswRegionNameLocSitemap));

                directoryList += `${consoleIndent}<li><a href="/${trade}-${industry}/${`${spacesToHyphens(
                    R.toLower(nswRegionNoThe)
                )}.html`}">${Trade} a ${Industry} Business in <strong>${NSWRegion}</strong></a></li>\n`;
            }

            directoryList += "</ul>\n";
            directoryList += `<a href="/${R.toLower(
                trade
            )}-childcare/sydney/index.html"><h6>${Trade} ${Industry} in Sydney</h6></a>\n`;

            // Sydney pages ----------

            logSection("Sydney");

            var Region = "Sydney";
            var sydLoc = `${outputLoc}${trade}-${industry}`;
            var sydNameLoc = sydLoc + "/sydney/index.html";
            var sydNameLocSitemap = `${trade}-${industry}` + "/sydney/index.html";

            var sydBreadcrumb =
                `<a href="/${trade}-childcare/sydney/index.html">Sydney</a>` +
                footerBreadcrumbsSeparator;

            var sydFooterBreadcrumbs = footerBreadcrumbsMake([
                ausFooterBreadcrumb,
                Region
            ]);

            var sydneyMobileBreadcrumbs = `<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home">${australiaMobileBreadcrumb}</li>`;

            var sydMenuBreadcrumbs = "";

            var schema = schemaMaker(schemaHomeAusSyd(tradeIndPath));

            var regionPath = tradeIndPath + "sydney/";

            var areaFilters = output =>
                areaFiltersMake(
                    {
                        footer            : sydneyFooterTemplate,
                        trade             : trade,
                        Trade             : Trade,
                        industry          : industry,
                        Industry          : Industry,
                        name              : region,
                        Name              : Region,
                        id                : "sydney",
                        schema            : schema,
                        keywords          : keyMake("", "", Trade, sydKeyArrTrade),
                        menuItems         : homeMenuBuy + homeMenuSell,
                        mobileBreadcrumbs : sydneyMobileBreadcrumbs,
                        footerBreadcrumbs : sydFooterBreadcrumbs,
                        heroImg           : "childcare-business-sydney.jpg",
                        contentImg        : "sydney-childcare-business-little-kid.jpg",
                        copyright         : copyright
                    },
                    output
                );

            var sydneyOutputFilters = outputTemplate =>
                R.pipe(
                    filter(
                        "regionFooterHeading",
                        `<div class="regionFooterHeading">${Trade} a Childcare Business in one of Sydney’s Regions:</div>`
                    ),
                    filter(
                        "regionFooterUl",
                        addUl("regionFooterUl", arrToLinks(regionPath, regions))
                    )
                )(outputTemplate);

            var sydneyOutputFile = R.pipe(
                generalFilters,
                areaFilters,
                sydneyOutputFilters
            )(sydneyTemplate);

            fs.writeFileSync(sydNameLoc, sydneyOutputFile);

            // Sydney Region pages ----------
            for (c = 0; c < regions.length; c++) {
                var region = R.toLower(regions[c]);
                var Region = theToLower(toTitleCase(regions[c]));
                var regionNoThe = noThe(region);
                var RegionNoThe = toTitleCase(noThe(regions[c]));
                var regionFilename = filenameMake(regionNoThe);

                logSection(Region);

                var sydLoc = `${outputLoc}${trade}-${industry}`;

                var sydNameLoc =
                    sydLoc + `/sydney/${spacesToHyphens(regionNoThe)}.html`;

                var regionFooterBreadcrumb = breadcrumbMakerGeneral(
                    suburbPath + regionFilename,
                    "",
                    RegionNoThe
                );

                var sydBreadcrumb =
                    `<a href="/${trade}-childcare/sydney/index.html">Sydney</a>` +
                    footerBreadcrumbsSeparator;

                var sydFooterBreadcrumbs = footerBreadcrumbsMake([
                    ausFooterBreadcrumb,
                    sydFooterBreadcrumb,
                    Region
                ]);

                var sydneyMobileBreadcrumbs =
                    `<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home">${australiaMobileBreadcrumb}</li>` +
                    "\n" +
                    `<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home">${sydneyMobileBreadcrumb}</li>`;

                var sydMenuBreadcrumbs =
                    breadcrumbSeparator +
                    `<span class="menuItem"><a href="/${trade}-childcare/sydney/index.html">Sydney</a></span>`;

                var schema = schemaMaker(
                    schemaHomeAusSydSydRegion(tradeIndPath, RegionNoThe)
                );

                var regionPath = tradeIndPath + "sydney/";

                var regionSuburbs = strToArr(
                    fileToStr(
                        `${srcLoc}regions/${spacesToHyphens(regionNoThe)}.txt`
                    )
                );

                var areaFilters = output =>
                    areaFiltersMake(
                        {
                            footer   : sydneyFooterTemplate,
                            trade    : trade,
                            Trade    : Trade,
                            industry : industry,
                            Industry : Industry,
                            name     : region,
                            Name     : Region,
                            NameNoThe : RegionNoThe,
                            id       : "sydney",
                            schema   : schema,
                            keywords : keyMake(
                                "Suburb",
                                Suburb,
                                Trade,
                                suburbKeyArrTrade
                            ),
                            menuItems         : homeMenuBuy + homeMenuSell,
                            mobileBreadcrumbs : sydneyMobileBreadcrumbs,
                            footerBreadcrumbs : sydFooterBreadcrumbs,
                            heroImg           :
                                "childcare-business-sydney-e1540876733126.jpg",
                            contentImg : "sydney-childcare-business2.jpg",
                            copyright  : copyright
                        },
                        output
                    );

                var sydneyOutputFilters = outputTemplate =>
                    R.pipe(
                        filter("homeMenuBuy", ""),
                        filter("homeMenuSell", ""),
                        filter(
                            "regionFooterHeading",
                            `<div class="regionFooterHeading">${Trade} a Childcare Business in one of ${Region}’s Suburbs:</div>`
                        ),
                        filter(
                            "regionFooterUl",
                            addUl(
                                "regionFooterUl",
                                arrToLinks(regionPath, regionSuburbs)
                            )
                        )
                    )(outputTemplate);

                var sydneyOutputFile = R.pipe(
                    generalFilters,
                    areaFilters,
                    sydneyOutputFilters
                )(sydneyTemplate);

                fs.writeFileSync(sydNameLoc, sydneyOutputFile);

                logPage(n, trade + " " + regionFilename);
                n++;

                sitemapStream.write(sitemapItem(sydNameLocSitemap));

                if (c > 0) {
                    directoryList += "</ul>\n";
                }
                directoryList += `<a href="/${R.toLower(
                    tradeIndPath + spacesToHyphens(noThe(region)) + ".html"
                )}-childcare/sydney/index.html"><h6 class="h7">${Trade} a ${Industry} Business in ${Region}</h6></a>\n`;
                directoryList += "<ul id=\"directoryUl\">\n";

                // Suburbs (Suburb Pages) --------------------
                var suburb = regionSuburbs[c];
                var Suburb = toTitleCase(regionSuburbs[c]);

                if (settings.genSuburbs === true || program.suburbs === true) {
                    logSection("Suburbs");

                    for (d = 0; d < regionSuburbs.length; d++) {
                        var suburb = regionSuburbs[d];
                        var Suburb = toTitleCase(regionSuburbs[d]);
                        const suburbFilename = filenameMake(suburb);

                        // const nearbySuburbs = ""

                        const nearbySuburbs = addUl(
                            "",
                            arrToLinks(
                                suburbPath,
                                getNearbyArr(suburb, locationsCache)
                            )
                        );

                        const nearbySuburbsHeading = `<div class="regionFooterHeading">${Trade}ing a ${toTitleCase(
                            industry
                        )} Business in Nearby Suburbs:</div>`;

                        const nameLoc = outputLoc + suburbPath + suburbFilename;
                        const sitemapNameLoc = suburbPath + suburbFilename;

                        const suburbFooterBreadcrumbs = footerBreadcrumbsMake([
                            ausFooterBreadcrumb,
                            sydFooterBreadcrumb,
                            regionFooterBreadcrumb,
                            suburb
                        ]);

                        var schema = schemaMaker(
                            schemaHomeAusSydSydRegionSuburb(
                                tradeIndPath,
                                RegionNoThe,
                                Suburb
                            )
                        );

                        var areaFilters = output =>
                            areaFiltersMake(
                                {
                                    footer   : suburbsFooterTemplate,
                                    trade    : trade,
                                    Trade    : Trade,
                                    industry : industry,
                                    Industry : Industry,
                                    name     : suburb,
                                    Name     : Suburb,
                                    id       : "suburb",
                                    schema   : schema,
                                    keywords : keyMake(
                                        "Suburb",
                                        Suburb,
                                        Trade,
                                        suburbKeyArrTrade
                                    ),
                                    menuItems         : homeMenuBuy + homeMenuSell,
                                    mobileBreadcrumbs : suburbMobileBreadcrumbs,
                                    footerBreadcrumbs : suburbFooterBreadcrumbs,
                                    heroImg           : "",
                                    contentImg        : "daycare-business-sydney.jpg",
                                    copyright         : copyright
                                },
                                output
                            );

                        const suburbOutputFilters = outputTemplate =>
                            R.pipe(
                                filter("nearby", nearbySuburbs),
                                filter(
                                    "nearbySuburbsHeading",
                                    nearbySuburbsHeading
                                ),
                                filter("RegionNoThe", RegionNoThe),
                                filter("Region", Region)
                            )(outputTemplate);

                        const suburbOutputFile = R.pipe(
                            generalFilters,
                            areaFilters,
                            suburbOutputFilters
                        )(suburbsTemplate);

                        fs.writeFileSync(nameLoc, suburbOutputFile);

                        logPage(n, `${trade} ${suburbFilename}`);
                        n++;

                        sitemapStream.write(sitemapItem(sitemapNameLoc));

                        directoryList += `${consoleIndent}<li><a href="/${R.toLower(
                            suburbPath + spacesToHyphens(suburbFilename)
                        )}">${Trade} a ${Industry} Business in <strong>${Suburb},<br />${RegionNoThe}</strong></a></li>\n`;
                    }
                } else {
                    cl(chalk.magenta("(Generating suburbs is turned off)"));
                }
            }

            // Make Australia pages ----------

            logSection("Australia");

            const ausLoc = `${outputLoc}${R.toLower(trade)}-${R.toLower(
                industry
            )}`;
            const ausNameLoc = ausLoc + "/index.html";
            const ausNameLocSitemap = `${R.toLower(trade)}-${R.toLower(
                industry
            )}` + "/index.html";

            var schema = schemaMaker(schemaHomeAus(tradeIndPath));

            const ausFooterBreadcrumbs = footerBreadcrumbsMake(["Australia"]);

            var menuItems = homeMenuBuy + homeMenuSell;

            var areaFilters = output =>
                areaFiltersMake(
                    {
                        footer : fileToStr(
                            `${srcLoc}${templateLoc}australia/footer-${trade}.html`
                        ),
                        trade             : trade,
                        Trade             : Trade,
                        industry          : industry,
                        Industry          : Industry,
                        name              : "",
                        Name              : "",
                        id                : "aus",
                        schema            : schema,
                        keywords          : keyMake("", "", Trade, ausKeyArrTrade),
                        menuItems         : menuItems,
                        mobileBreadcrumbs : "",
                        footerBreadcrumbs : ausFooterBreadcrumbs,
                        heroImg           : "",
                        contentImg        : "childcare-businesses-sydney.jpg",
                        copyright         : copyright
                    },
                    output
                );

            var homeFooterFilters = output =>
                homeFooterFiltersMake(industry, output);

            const ausOutputFilters = outputTemplate =>
                R.pipe(
                    filter(
                        "footerHeadingBuy",
                        "<div class=\"home-footer-heading-buy\">Buy:</div>"
                    ),
                    filter(
                        "footerBuyNsw",
                        "<ul class=\"home-footer-heading-nsw\"><li><a href=\"/buy-childcare/nsw.html\">NSW</a></li></ul>"
                    ),
                    filter("footerBuyNswRegions", nswRegionUl(trade, industry))
                )(outputTemplate);

            const ausOutputFile = R.pipe(
                generalFilters,
                areaFilters,
                ausOutputFilters,
                homeFooterFilters
            )(ausTemplate);

            fs.writeFileSync(ausNameLoc, ausOutputFile);

            logPage(n, `${trade} Australia`);
            n++;

            sitemapStream.write(sitemapItem(ausNameLocSitemap));
        }

        // Make Home page ----------

        logSection("Other Pages");

        var schema = schemaMaker(schemaHome);

        const homeButtonBuy =
            "<a href=\"/buy-childcare/index.html\" class=\"abbaButton abbaButton-buy\">Buy a Childcare Business</a>";
        const homeButtonSell =
            "<a href=\"/sell-childcare/index.html\"  class=\"abbaButton abbaButton-sell\">Sell a Childcare Business</a>";

        var menuItems = homeMenuBuy + homeMenuSell;

        var areaFilters = output =>
            areaFiltersMake(
                {
                    footer            : homeFooterTemplate,
                    trade             : trade,
                    Trade             : Trade,
                    industry          : industry,
                    Industry          : Industry,
                    name              : "",
                    Name              : "",
                    id                : "home",
                    schema            : schema,
                    keywords          : keyMake("", "", "", ausKeyArrAll),
                    menuItems         : menuItems,
                    mobileBreadcrumbs : "",
                    footerBreadcrumbs : "",
                    heroImg           : "",
                    contentImg        : "",
                    copyright         : copyright
                },
                output
            );

        var homeFooterFilters = output =>
            homeFooterFiltersMake(industry, output);

        const homeOutputFilters = outputTemplate =>
            R.pipe(
                filter("buttonBuy", homeButtonBuy),
                filter("buttonSell", homeButtonSell)
            )(outputTemplate);

        const homeOutputFile = R.pipe(
            generalFilters,
            areaFilters,
            homeOutputFilters,
            homeFooterFilters
        )(homeTemplate);

        fs.writeFileSync(`${outputLoc}/index.html`, homeOutputFile);

        logPage(n, "Home index.html");
        n++;

        sitemapStream.write(sitemapItem("index.html"));

        // Make About Us page (About Page) ----------

        var schema = schemaMaker(schemaHomeAbout);

        const aboutFooterBreadcrumbs = footerBreadcrumbsMake(["About Us"]);

        var menuItems = homeMenuBuy + homeMenuSell;

        var areaFilters = output =>
            areaFiltersMake(
                {
                    footer            : homeFooterTemplate,
                    trade             : trade,
                    Trade             : Trade,
                    industry          : industry,
                    Industry          : Industry,
                    name              : "",
                    Name              : "",
                    id                : "about",
                    schema            : schema,
                    keywords          : keyMake("", "", "", ausKeyArrAll),
                    menuItems         : menuItems,
                    mobileBreadcrumbs : "",
                    footerBreadcrumbs : aboutFooterBreadcrumbs,
                    heroImg           : "",
                    contentImg        : "",
                    copyright         : copyright
                },
                output
            );

        const aboutOutputFilters = outputTemplate =>
            R.pipe(
                filter(
                    "footerBuySyd",
                    "<ul><li><a href=\"/buy-childcare/sydney/index.html\">Sydney</a></li></ul>"
                ),
                filter(
                    "footerSellSyd",
                    "<ul><li><a href=\"/sell-childcare/sydney/index.html\">Sydney</a></li></ul>"
                ),
                filter(
                    "footerBuySydRegions",
                    footerUl("", "buy-childcare/sydney/", regions)
                ),
                filter(
                    "footerSellSydRegions",
                    footerUl("", "sell-childcare/sydney/", regions)
                )
            )(outputTemplate);

        const aboutOutputFile = R.pipe(
            generalFilters,
            areaFilters,
            aboutOutputFilters,
            homeFooterFilters
        )(aboutTemplate);

        fs.writeFileSync(`${outputLoc}/about-us.html`, aboutOutputFile);

        logPage(n, "about-us.html");
        n++;

        sitemapStream.write(sitemapItem("about-us.html"));

        // Make Contact Us page ----------

        var schema = schemaMaker(schemaHomeContact);

        const contactFooterBreadcrumbs =
            footerBreadcrumbsOpen +
            homeFooterBreadcrumb +
            footerBreadcrumbsSeparator +
            "Contact Us" +
            footerBreadcrumbsClose;

        var menuItems = homeMenuBuy + homeMenuSell;

        var areaFilters = output =>
            areaFiltersMake(
                {
                    footer            : pagesFooterTemplate,
                    trade             : trade,
                    Trade             : Trade,
                    industry          : industry,
                    Industry          : Industry,
                    name              : "",
                    Name              : "",
                    id                : "contact",
                    schema            : schema,
                    keywords          : keyMake("", "", "", ausKeyArrAll),
                    menuItems         : menuItems,
                    mobileBreadcrumbs : "",
                    footerBreadcrumbs : contactFooterBreadcrumbs,
                    heroImg           : "",
                    contentImg        : "",
                    copyright         : copyright
                },
                output
            );

        const contactOutputFile = R.pipe(
            generalFilters,
            areaFilters
        )(contactTemplate);

        fs.writeFileSync(`${outputLoc}/contact-us.html`, contactOutputFile);

        logPage(n, "contact-us.html");
        n++;

        directoryList += "</ul>\n";

        sitemapStream.write(sitemapItem("contact-us.html"));
    }

    // Directory ----------

    var schema = schemaMaker(schemaHomeDirectory);

    const directoryFooterBreadcrumbs = footerBreadcrumbsMake(["Directory"]);

    var menuItems = homeMenuBuy + homeMenuSell;

    var areaFilters = output =>
        areaFiltersMake(
            {
                footer            : pagesFooterTemplate,
                trade             : trade,
                Trade             : Trade,
                industry          : industry,
                Industry          : Industry,
                name              : "",
                Name              : "",
                id                : "directory",
                schema            : schema,
                keywords          : keyMake("", "", "", ausKeyArrAll),
                menuItems         : menuItems,
                mobileBreadcrumbs : "",
                footerBreadcrumbs : directoryFooterBreadcrumbs,
                heroImg           : "",
                contentImg        : "",
                copyright         : copyright
            },
            output
        );

    const directoryOutputFilters = outputTemplate =>
        R.pipe(filter("directoryList", directoryList))(outputTemplate);

    const directoryOutputFile = R.pipe(
        generalFilters,
        areaFilters,
        directoryOutputFilters
    )(directoryTemplate);

    fs.writeFileSync(`${outputLoc}/directory.html`, directoryOutputFile);

    logPage(n, "directory.html");
    n++;

    sitemapStream.write(sitemapFooter);
    sitemapStream.end();

    logPage(n, "sitemap.xml");
    n++;
})();

// Website Summary

const websiteSummaryOutputFile = R.pipe(
    filter("rootUrl", settings.rootUrl),
    filter("pageCount", n)
)(websiteSummaryTemplate);

fs.writeFileSync(`${outputLoc}/website-summary.html`, websiteSummaryOutputFile);

logPage(n, "website-summary.html");

// End performance timer
const endTime = now();
const duration = ((endTime - startTime) / 1000).toFixed(3);

// Console log final output
cl("");
cl(chalk.cyan(eq5) + chalk.bold.yellow(` Finished in ${duration} seconds at ${time} `) + chalk.cyan(eq5));
cl(chalk.green("Output location: ") + outputLoc);
cl("");
