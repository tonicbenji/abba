const fs = require("fs");
const R = require("ramda");
const now = require("performance-now");
const program = require("commander");
const dateFormat = require("dateformat");
const shuffleSeed = require("shuffle-seed");

// Personal modules

const settings = require("./gen-config");
const U = require("./utilities");

// Guide

// This website generator maps over lists of data to generate pages using different templates and data. It uses the Ramda library to process data.
// The generator first maps over a list of page types. For each page type, it calls a function that will generate the pages for that type of page. This second function will map over its own data, merging it with general data. It may also call even more specific map functions if it needs to, in order to generate pages that depend on data from their parent.
// The maps output only side effects. They don't build up values due to performance considerations.
// Map structure:
// 1. Map pageTypes
// 1.1. Map pages

// TODO: make the subset feature use list truncation based on a fraction instead of the global counter method

// Paths

const paths = {
    suburbs: {
        data: "src/suburbs/demo-suburbs.txt",
        template: "demo-template.html"
    }
};

// Replace Tokens

const generalReplace = ({ name }) => {
    return {
        name: name,
        Name: U.titleCase(name)
    };
};

const suburbReplace = ({ suburb }) => {
    return {
        suburb,
        Suburb: U.titleCase(suburb)
    };
};

// TODO: make more specific ones e.g. suburbReplace, then in genSuburbs use R.mergeRight to override default values with specific values

const replaceTokens = (data, template) => {
    let OUTPUT = template;
    R.mapObjIndexed((num, key, obj) => {
        OUTPUT = U.replaceToken(key, data[key])(OUTPUT);
    }, data);
    return OUTPUT;
};

// Generators

const gen = pageTypes =>
    pageTypes.map(pageType => {
        const { template, data } = paths[pageType];
        const template_ = U.fileToStr(template);
        const data_ = U.fileToList(data);
        // TODO: make this work - removeAllEmpty to data_ by making the data sourcing more compositional
        // const data__ = R.pipe(
        //     U.pathToList,
        //     U.removeAllEmpty,
        //     fs.readFileSync,
        //     R.toString
        // )(data);
        switch (pageType) {
            case "suburbs":
                genSuburbs(template_, data_);
                break;
            default:
                U.error("No valid pageTypes specified in config");
        }
    });

const genSuburbs = (template, data) =>
    data.map(suburb => {
        // Build token replace object
        const replaces = R.mergeRight(
            generalReplace({ name: suburb }),
            suburbReplace({ suburb })
        );
        // Outputs
        console.log(replaceTokens(replaces, template));
        U.genLog(suburb);
    });

gen(settings.pageTypes);
