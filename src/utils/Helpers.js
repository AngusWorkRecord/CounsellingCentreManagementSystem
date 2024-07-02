// import moment from "moment";

// validation functions
export const isStringNullOrEmpty = (value) => {
    if (typeof value === 'undefined')
        return true;
    if (value === null || value == null)
        return true;
    if (typeof value === "string" && value.trim() === "")
        return true;
    return false;
}

export const isObjectUndefinedOrNull = (obj) => {
    if (typeof obj === 'undefined' || obj === null)
        return true;
    return false;
}

export const isArrayNotEmpty = (list) => {
    try {
        if (typeof list !== 'undefined' && list !== null && Array.isArray(list) && list.length > 0)
            return true
        return false
    }
    catch (e) {
        console.log(e)
        return false
    }
}
export const getRandomNumberBetween = (min, max, decimalPlaces) => {
    const rand = Math.random() < 0.5 ? ((1 - Math.random()) * (max - min) + min) : (Math.random() * (max - min) + min);  // could be min or max or anything in between
    const power = 10 ** decimalPlaces;
    return Math.floor(rand * power) / power;
}

export const numberWithCommas = (x) => x.toLocaleString(undefined, { maximumFractionDigits: 2 });