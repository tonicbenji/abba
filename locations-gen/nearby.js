// External libraries ----------

const R = require('ramda');
const geolib = require('geolib');

// External data ----------

// const location = require('./locationData');
const location = require('./demo-locationData');

// For testing ----------

// all --> console log
c = (...args) => {
    console.log(...args)
}

// all --> output
const output = (suburb, length) => {
    return c(
        nearbySuburbsArr(suburb, length)
    );
};

// (suburb, suburb) --> distance
const distFromSuburbs = (suburbA, suburbB) => {
    return geolib.getDistance(
        suburbCoords(suburbA),
        suburbCoords(suburbB)
    );
}

// ----------

// ("suburbsData.text", [suburbsData]) --> {suburbsData item}
const getSuburbFromName = name => {
    return R.filter(
        R.propEq('text', name),
        location.suburbsData
    )[0];
}

// suburb name --> {coordinates in geolib format}
const getCoords = suburb => {
    return {latitude: suburb.lat, longitude: suburb.long}
}

// suburb name --> {coordinates in geolib format}
const suburbCoords = suburb => {
    return getCoords(getSuburbFromName(suburb));
}

// (coordinate number, coordinate number) --> distance
const dist = (coordsA, coordsB) => {
    return geolib.getDistance(coordsA, coordsB);
}

// (item, array) --> [array without item]
const without = (item, array) => {
    return R.reject(R.equals(item), array);
}

// (suburb, [suburbsData]) --> [suburbsData without suburb]
const otherSuburbsData = suburb => {
    return without(getSuburbFromName(suburb), location.suburbsData);
}

// (suburb, [array]) --> [distances from suburb to all suburbs]
const distToAll = (suburb, data) => {
    var i;
    var distArr = [];
    for (i = 0; i < data.length; i++) {
        distArr.push(
            dist(suburbCoords(suburb), getCoords(data[i]))
        );
    }
    return distArr;
}

// (suburb, data) --> [distances from suburb to all suburbs except itself]
const distToOthers = (suburb, data) => {
    return distToAll(suburb, otherSuburbsData(suburb));
}

// [numbers] --> minimum number in array
const arrMin = data => {
    return Math.min.apply(null, data);
}

// [numbers] --> [indexes]
const indexOfMin = data => {
    return data.indexOf(arrMin(data));
}

// (item, [array]) --> [array without item]
const arrWithoutItem = (item, data) => {
    return R.reject(i => R.equals(i, item), data);
}

// (index number, [suburbsData]) --> {suburb object}
const getSuburbFromIndex = index => {
    return location.suburbsData[index].text;
}

// (suburb name, length of desired array) --> [minimum values]
const arrMinsArr = (suburb, length) => {
    var remainingArr = distToOthers(suburb);
    var minsArr = [arrMin(remainingArr)];
    for (i = 0; i < length; i++) {
        var minArr = arrMin(remainingArr);
        minsArr.push(
            minArr
        );
        remainingArr = arrWithoutItem(
            minArr,
            remainingArr
        )
    }
    return minsArr;
}

// (suburb name, length of desired array) --> [minimum values]
const getIndex = (value, data) => {
    return R.filter(
        R.equals(value),
        location.suburbsData
    );
}

// (suburb name, length of desired array) --> [indexes]
const indexMinsArr = (suburb, length) => {
    const origArr = distToOthers(suburb);
    const minsArr = arrMinsArr(suburb, length);
    var indexArr = [];
    for (i = 1; i < minsArr.length; i++) {
        indexArr.push(
            R.indexOf(minsArr[i], origArr)
        );
    }
    return indexArr
}

// ([indices], length of desired array) --> [suburb names]
const suburbsMinsArr = (data, length) => {
    var suburbsArr = [];
    for (i = 0; i < data.length; i++) {
        suburbsArr.push(
            location.suburbsData[data[i]].text
        );
    }
    return suburbsArr;
}

// (suburb, length of desired array) --> [suburb names]
const nearbySuburbsArr = (suburb, length) => {
    return suburbsMinsArr(
        indexMinsArr(suburb, length),
        length
    );
}

// Exports ----------

module.exports = {
    nearbySuburbsArr,
};
