'use strict';

const Exchange = require('./exchange');

let bitrrexConfig = {
  name: 'bittrex',
  URL: {
    marketSummary: 'https://bittrex.com/api/v1.1/public/getmarketsummaries',
  },
  fee: 0.0025, // https://bittrex.com/Fees
  api: {
    tradesInfo: 'result',
    tradePair: 'MarketName',
    pairSplit: '-',
    sourceIndex: 0,
    targetIndex: 1,
    lastPrice: 'Last',
    bidPrice: 'Bid',
    askPrice: 'Ask'
  }
}

module.exports = new Exchange(bitrrexConfig);