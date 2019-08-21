// Node libraries ----------

const fs = require("fs");
const R = require("ramda");
const geolib = require("geolib");
const now = require("performance-now");
const program = require("commander");

// Personal Settings ----------

const settings = {
    demo: true,
    nearbyNum: 6
};

// Command line arguments

program.option("-f, --full", "Run full version, not demo").parse(process.argv);

// External data ----------

const demo = program.full === true || settings.demo === false ? "" : "demo-";

const data = JSON.parse(
    fs.readFileSync(`./${demo}wikipedia-locationData.json`)
);
const destination = `./${demo}locations-cache.json`;

// Utilities ----------

// Console log any number of arguments
cl = (...args) => {
    console.log(...args);
};

// Create equals separators
const eqSep = num => "=".repeat(num);

// Make console log heading
const logHeading = str =>
    cl("\n" + eqSep(5) + " " + str + " " + eqSep(5) + "\n");

// Make console log saying that a page has been made
const logPage = str => cl("Made: " + str);

// Get an array that is the same as another array but without a single item
const without = (item, array) => {
    return R.reject(R.equals(item), array);
};

// Sort an array of pairs of arrays by the second item in each pair
const pairsSecondSort = arr => R.sortBy(x => x[1], arr);

// Convert an array of pairs of arrays into an array containing just the first item of each pair
const pairsToFirst = arr => R.map(x => x[0], arr);

// Nearby functions ----------

// Make a geolib-compatible latitude-longitude object
const coordObj = (lat, lng) => {
    return {latitude: lat, longitude: lng};
};

// Get the distance from one pair of coordinates to another
const dist = (latA, lngA, latB, lngB) => {
    return geolib.getDistance(coordObj(latA, lngA), coordObj(latB, lngB));
};

// Make an array of the other suburbs to a particular suburb, including the name, latitude and longitude of each of them
const otherSuburbsArr = (item, obj) => {
    var otherSuburbs = without(item, obj);
    var arr = [];
    otherSuburbs.forEach(otherItem => {
        arr.push([
            otherItem.nme,
            dist(otherItem.lat, otherItem.lng, item.lat, item.lng)
        ]);
    });
    return arr;
};

// Make an array of the nearby suburbs to a particular suburb. This function filters and formats the raw data returned by otherSuburbsArr
const nearbySuburbsArr = (item, length, obj) => {
    return R.pipe(
        pairsSecondSort,
        pairsToFirst,
        R.take(length)
    )(otherSuburbsArr(item, obj));
};

// Make a JSON string of each suburb with its nearby suburbs
const cacher = (length, obj) => {
    var cachedData = [];
    var i = 1;
    obj.forEach(item => {
        cachedData.push(R.objOf(item.nme, nearbySuburbsArr(item, length, obj)));
        logPage(`${i}. ${item.nme}`);
        i++;
    });
    return JSON.stringify(cachedData, null, 4);
};

// Output ----------

const startTime = now();

logHeading("Nearby Locations Cacher");

fs.writeFileSync(destination, cacher(settings.nearbyNum, data), "utf-8");

const endTime = now();
const duration = ((endTime - startTime) / 1000).toFixed(3);
logHeading(`Completed in ${duration} seconds`);
