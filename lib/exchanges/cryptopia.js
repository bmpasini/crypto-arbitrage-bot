'use strict';

const Exchange = require('./exchange');

let cryptopiaConfig = {
  name: 'cryptopia',
  URL: {
    marketSummary: 'https://www.cryptopia.co.nz/api/GetMarkets/BTC'
  },
  fee: 0.002, // https://bittrex.com/Fees
  api: {
    tradesInfo: 'Data',
    tradePair: 'Label',
    pairSplit: '/',
    sourceIndex: 1,
    targetIndex: 0,
    lastPrice: 'LastPrice',
    bidPrice: 'BidPrice',
    askPrice: 'AskPrice'
  }
}

module.exports = new Exchange(cryptopiaConfig);