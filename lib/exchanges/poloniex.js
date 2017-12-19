'use strict';

const Exchange = require('./exchange');

let poloniexConfig = {
  name: 'poloniex',
  URL: {
    marketSummary: 'https://poloniex.com/public?command=returnTicker'
  },
  fee: 0.0025, // https://poloniex.com/fees/
  parsePrices
}

function parsePrices(apiResponse) {
  let compiledPrices = {};
  try {
    const tradesInfo = apiResponse;
    for (let tradePair in tradesInfo) {
      const coinInfo = tradesInfo[tradePair];

      tradePair = tradePair.split('_');
      let sourceCoin = tradePair[0];
      let targetCoin = tradePair[1];

      const isTradeEnabled = this._isTradeEnabled(sourceCoin, targetCoin);

      if (isTradeEnabled) {
        const lastPrice = coinInfo.last;
        const bidPrice = coinInfo.highestBid;
        const askPrice = coinInfo.lowestAsk;
        compiledPrices[targetCoin] = { lastPrice, bidPrice, askPrice };
      }
    }
    return compiledPrices;
  }
  catch (err) {
    console.error('ERROR: ', err);
    throw new Error ('compile prices of poloniex is broken (API has probably changed)');
  }
}

module.exports = new Exchange(poloniexConfig);