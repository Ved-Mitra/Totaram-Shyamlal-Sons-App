let prices = {
    gold: null,
    silver: null,
    lastUpdated: null
};

function updatePrices(newData) {
    prices = {
        ...prices,
        ...newData,
        lastUpdated: Date.now()
    };
}

function getPrices() {
    return prices;
}

module.exports = { updatePrices, getPrices };