'use strict';

const Promise = require('bluebird');
const httpClient = require('./http-client');
const settings = require('../settings');

const tradeSourceCoins = ['BTC']; // only one has been implemented so far
const tradeTargetCoins = ['BTC', 'ETH', 'LTC'];

const tradeSourceCoinSet = new Set(tradeSourceCoins);
const tradeTargetCoinsSet = new Set(tradeTargetCoins);

class Exchange {
  constructor(config) {
    this.name = config.name;
    this.URL = config.URL;
    this.fee = config.fee;
    if (config.api) {
      this.api = this._validateApi(config.api);
    }
    else if (config.parsePrices) {
      this.parsePrices = config.parsePrices;
    }
  }

  _validateApi(api) {
    if (typeof api.tradesInfo === 'undefined') throw new Error('API missing tradesInfo');
    if (typeof api.tradePair === 'undefined') throw new Error('API missing tradePair');
    if (typeof api.lastPrice === 'undefined') throw new Error('API missing lastPrice');
    if (typeof api.pairSplit === 'undefined') throw new Error('API missing pairSplit');
    if (typeof api.sourceIndex === 'undefined') throw new Error('API missing sourceIndex');
    if (typeof api.targetIndex === 'undefined') throw new Error('API missing targetIndex');
    return api;
  }

  _isTradeEnabled(sourceCoin, targetCoin) {
    return tradeSourceCoinSet.has(sourceCoin) && tradeTargetCoinsSet.has(targetCoin);
  }

  refreshPrices() {
    const url = this.URL.marketSummary;
    const exchangeName = this.name;
    return httpClient.getExchangeMarketSummary(url, exchangeName)
      .then(apiResponse => {
        // if (!this.parsePrices) {
        //   throw new Error('parsePrices is not implemented for %s', exchange.name);
        // }
        this.lastPrices = this.parsePrices(apiResponse);
      });
  }

  refreshBalance() {
    if (settings.testMode) {
      return _testRefreshBalance();
    }
    throw new Error('refreshBalance logic not implemented.');
  }

  buyCoin(coinName) {
    if (settings.testMode) {
      return this._testBuyCoin(coinName);
    }
    throw new Error('buyCoin logic not implemented.');
  }

  sellCoin(coinName) {
    if (settings.testMode) {
      return this._testSellCoin();
    }
    throw new Error('sellCoin logic not implemented.');
  }

  parsePrices(apiResponse) {
    let compiledPrices = {};
    try {
      const tradesInfo = apiResponse[this.api.tradesInfo];
      for (let coinInfo of tradesInfo) {

        let tradePair = coinInfo[this.api.tradePair].split(this.api.pairSplit);
        let sourceCoin = tradePair[this.api.sourceIndex];
        let targetCoin = tradePair[this.api.targetIndex];

        const isTradeEnabled = this._isTradeEnabled(sourceCoin, targetCoin);

        if (isTradeEnabled) {
          const lastPrice = coinInfo[this.api.lastPrice];
          const bidPrice = coinInfo[this.api.bidPrice];
          const askPrice = coinInfo[this.api.askPrice];
          compiledPrices[targetCoin] = { lastPrice, bidPrice, askPrice };
        }
      }
      return compiledPrices;
    }
    catch (err) {
      console.error('ERROR: ', err);
      throw new Error ('compile prices of ' + this.config.name + ' is broken (API has probably changed)');
    }
  }

  _testRefreshBalance() {
    this.balance = testBalance;
    return Promise.resolve();
  }

  _testBuyCoin(coinName) {
  }

  _testSellCoin(coinName) {
  }
}

module.exports = Exchange;