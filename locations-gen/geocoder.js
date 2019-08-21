const gMaps = require("@google/maps").createClient({
    key: "AIzaSyD00s1RFH9vljukyPEbLY148ZmED_iTeIE"
});
const R = require("ramda");
const fs = require("fs");
const now = require("performance-now");
const program = require("commander");

// Command line arguments

program.option("-f, --full", "Run full version, not demo").parse(process.argv);

// Utilities ----------

// Console log any number of arguments
const cl = (...args) => {
    console.log(...args);
};

// Create equals separators
const eqSep = num => "=".repeat(num);

// Make console log heading
const logHeading = str =>
    cl("\n" + eqSep(5) + " " + str + " " + eqSep(5) + "\n");

// Logs when a suburb has been geocoded
const logSuburb = str => cl("Geocoded: " + str);

// Splits a string into a list of lines of the string
const lines = str => R.split("\n", str);

// Splits a string into a list of words of the string
const words = str => R.split(" ", str);

// Extract the part of the string before the comma
const beforeComma = str => str.match(/[^,]*/i)[0]

// External data ----------

const demo = program.full === true ? "" : "demo-";

const addresses = R.pipe(
    fs.readFileSync,
    R.toString,
    R.trim,
    lines
)(`./${demo}locations.txt`)

const destination = `./${demo}wikipedia-locationData.json`;

// Geocoding function ----------

const geocoder = (addr, callback) => {
    var coords = [];
    var i = 1;
    addr.forEach(item => {
        gMaps.geocode(
            {address: item},
            (err, response) => {
                if (!err) {
                    // var nme = response.json.results[0].address_components[0].long_name;
                    var nme = beforeComma(item)
                    coords.push(
                        // Create an object from the name of the suburb plus its latitude and longitude
                        R.merge(
                            R.objOf("nme", nme),
                            response.json.results[0].geometry.location
                        )
                    );
                    logSuburb(`${i}. ${nme}`);
                    i++;
                    if (coords.length === addr.length) {
                        if( typeof callback === 'function' ) {
                            callback(coords);
                        }
                    }
                }
            }
        );
    })
}

// Output ----------

logHeading("Geocoder - Google Maps API");
const startTime = now();

geocoder(addresses, results => {
    fs.writeFileSync(destination,
        JSON.stringify(results, null, 4),
        "utf-8");
    const endTime = now();
    const duration = ((endTime - startTime) / 1000).toFixed(3);
    logHeading(`Completed in ${duration} seconds`);
});
