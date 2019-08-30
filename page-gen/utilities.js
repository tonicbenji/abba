const fs = require("fs");
const path = require("path");
const R = require("ramda");
const chalk = require("chalk");
const changeCase = require("change-case");
const dateFormat = require("dateformat");
const settings = require("./gen-config");
const shuffleSeed = require("shuffle-seed");

// Globals

let PAGE_COUNT = 0;

// Filesystem

const pathToList = p => p.split("/");

const relPath = p => path.join(__dirname, ...pathToList(p));

const relPathList = l => path.join(__dirname, ...l);

const readFile = p => fs.readFileSync(relPath(p));

const fileToStr = p => readFile(p).toString();

const fileToList = p => fileToStr(p).split("\n");

const prettyPath = l => l.join("/");

// String Manipulation

const theToLower = s => s.replace(/the/i, "the");

const noThe = s => s.replace(/the/i, "");

const wrapInLinebreaks = s => `\n${s}\n`;

const wrapInSpaces = s => ` ${s} `;

const filenameCase = name => changeCase.paramCase(noThe(name));

const filenameFormat = name => `${filenameCase(name)}.html`;

const tokenise = s => `{{${s}}}`;

const replaceTokens = (data, template) => {
    let OUTPUT = template;
    R.mapObjIndexed((num, key, obj) => {
        OUTPUT = R.replace(new RegExp(tokenise(key), "g"), data[key], OUTPUT);
    }, data);
    return OUTPUT;
};

const escForwardSlashes = str => R.replace(/\//g, "\\/", str);

const stringList = s => s.join(", ");

// Data Manipulation

const removeAllEmpty = ss => R.reject(R.isEmpty, ss);

const mergeDeepAll = l => R.reduce(R.mergeDeepRight, {}, l);

// Logging

const warning = s => console.log(chalk.red(s));

const genLog = (action, name, path) => {
    if (settings.briefLogs) {
        process.stdout.write(`${PAGE_COUNT++}. `);
    } else {
        const actionColour = R.cond([
            // Needed to be written in point-free style for some reason due to Ramda library
            [R.equals("Buy"), chalk.green],
            [R.equals("Sell"), chalk.blue],
            [R.equals("Single"), chalk.cyan],
            [R.equals("Skipped"), chalk.red]
        ]);
        console.log(
            chalk.yellow(`${PAGE_COUNT++}. `) +
                `${actionColour(action)} ${name} ${chalk.gray(path)}`
        );
    }
};

const headerLog = s =>
    R.pipe(
        wrapInSpaces,
        chalk.bgMagenta,
        wrapInLinebreaks,
        console.log
    )(s);

const performanceLog = time =>
    console.log(
        wrapInLinebreaks(
            chalk.grey(`Completed in ${chalk.yellow(time)} seconds. ${chalk.yellow(settings.subset * 100 + "%")} of suburbs generated.`)
        )
    );

// Streams

const sitemapStream = fs.createWriteStream(
    relPath(`${settings.outputLocation}/sitemap.xml`)
);

const sitemapItem = (path, lastmod) => `
<url>
    <loc>${path}</loc>
    <lastmod>${lastmod}</lastmod>
</url>`;

const directoryStream = fs.createWriteStream(
    relPath(`${settings.outputLocation}/directory.html`)
);

const directoryItem = (path, text) => `
<li><a href="${path}">${text}</a></li>`;

// Dates

const universalDate = dateFormat(new Date(), "yyyy-mm-dd");

const year = dateFormat(new Date(), "yyyy");

// Components

const link = (name, path) => `<a href="/${path}">${name}</a>`;

const footerBreadcrumbs = namePathList => {
    const list = namePathList.map((x, i) => {
        const [name, path] = x;
        if (i + 1 !== namePathList.length) {
            return link(name, path);
        } else {
            return name;
        }
    });
    return `
<span class="footerBreadcrumbs text-center block">
    ${list.join('<span class="fa fa-angle-right footerSeparator"></span>')}
</span>`;
};

const mobileBreadcrumb = (name, path) =>
    `<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home"><a class="nowrap" href="/${path}">« ${name}</a></li>`

const mobileBreadcrumbs = namePathList => namePathList.map(([name, path]) => mobileBreadcrumb(name, path)).join("")

const scriptTag = s => `<script type="application/ld+json">${s}</script>`;

const schema = namePathList => {
    const item = (i, name, path) => {
        return {
            "@type": "ListItem",
            position: i + 1,
            item: {
                "@id": settings.domain + path,
                name: name
            }
        };
    };
    return R.pipe(
        JSON.stringify,
        scriptTag
    )({
        "@context": "http://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: namePathList.map((x, i) => item(i, x[0], x[1]))
    });
};

const ul = s => `<ul>${s}</ul>`;

const li = s => `<li>${s}</li>`;

const nswRegionFooterList = (pathSegment, regionsList) => {
    return ul(
        `<li><a href="/${pathSegment}/sydney/index.html">Sydney&nbsp;»</a></li>` +
            regionsList
                .map(x =>
                    li(
                        link(
                            `${x}&nbsp;»`,
                            `${pathSegment}/${changeCase.paramCase(
                                noThe(x)
                            )}.html`
                        )
                    )
                )
                .join("")
    );
};

const cityRegionFooterList = (pathSegment, city, regionsList) => {
    return ul(
        regionsList
            .map(x =>
                li(
                    link(
                        `${x}&nbsp;»`,
                        `${pathSegment}/${city}/${changeCase.paramCase(
                            noThe(x)
                        )}.html`
                    )
                )
            )
            .join("")
    );
};

const id = id => `id=${id}`;

const makeKeywords = obj => {
    return R.pipe(
        R.values,
        R.unnest,
        l => shuffleSeed.shuffle(l, this.name),
        R.take(8),
        stringList,
        s => `"${s}"`
    )(obj);
};

const contextualKeywords = ({ trade, industry, name }) => {
    return {
        contextual: [
            `${trade} a ${industry} Business ${name}`,
            `${trade} ${settings.business.trade} ${name}`
        ]
    };
};

module.exports = {
    pathToList,
    relPath,
    readFile,
    fileToStr,
    fileToList,
    warning,
    genLog,
    removeAllEmpty,
    relPathList,
    theToLower,
    noThe,
    headerLog,
    prettyPath,
    performanceLog,
    filenameCase,
    filenameFormat,
    replaceTokens,
    tokenise,
    sitemapItem,
    sitemapStream,
    directoryStream,
    directoryItem,
    universalDate,
    year,
    link,
    footerBreadcrumbs,
    schema,
    ul,
    li,
    nswRegionFooterList,
    cityRegionFooterList,
    id,
    escForwardSlashes,
    mergeDeepAll,
    stringList,
    makeKeywords,
    contextualKeywords,
    mobileBreadcrumbs
};
