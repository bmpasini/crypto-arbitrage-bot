'use strict';

const Promise = require('bluebird');
const exchangesRegistry = require('./exchanges/registry');

// {ETH : {bitrrex : 0.03730002, cryptopia: 0.03730605} }

class ExchangesManager {
  constructor(settings) {
    this.priceRegistry = {};
    this.exchanges = this._activateExchanges(settings);
  }

  getExchanges() {
    return this.exchanges;
  }

  getPrices() {
    return this.priceRegistry;
  }

  getFees(exchangeName) {
    return this.exchanges[exchangeName].fee;
  }

  getAccountBalance(exchangeName) {
    const exchange = this.exchanges[exchangeName];
    return exchange.refreshBalance()
      .then(() => exchange.balance);
  }

  // this will have to work fast (async calls), time has to be measured and a threshold should be used, so the trade data doesn't become stale
  getUpdatedPrices() {
    let requests = [];
    for (const exchangeName in this.exchanges) {
      const exchange = this.exchanges[exchangeName];
      const pricesRequest = this._updateExchangePrices(exchange);
      requests.push(pricesRequest);
    };
    return Promise.all(requests)
      .then(() => this.priceRegistry)
      .catch(err => { // log error and kill bot
        console.error(err);
        throw err;
      });
  }

  _updateExchangePrices(exchange) { // TODO: make this use async / await
    return exchange.refreshPrices()
      .then(() => this._updateRegistry(exchange));
  }

  _updateRegistry(exchange) {
    const exchangeName = exchange.name;
    const exchangePrices = exchange.lastPrices;
    for (let coinName in exchangePrices) {
      // console.log('coinName', coinName);
      const coinPrice = exchangePrices[coinName];
      this.priceRegistry[coinName] = this.priceRegistry[coinName] || {}; // init coin in registry
      this.priceRegistry[coinName][exchangeName] = coinPrice;
    }
  }

  // called on initialization
  _activateExchanges(settings) {
    const activeExchanges = [];
    const exchanges = {};
    for (const exchangeName in settings.activeExchanges) {
      if (settings.activeExchanges[exchangeName]) {
        const exchange = exchangesRegistry[exchangeName];
        if (!exchange) {
          throw new Error('Exchange not supported: ' +  exchangeName);
        }
        activeExchanges.push(exchangeName);
        exchanges[exchangeName] = exchange;
      }
    }
    console.log('Active exchanges: %s', activeExchanges);
    if (activeExchanges.length < 2) {
      throw new Error('Must activate at least 2 exchanges');
    }
    return exchanges;
  }
}

let instance;

function getInstance(settings) {
  if (!instance) {
    instance = new ExchangesManager(settings);
  }
  return instance;
}

function resetInstance() {
  instance = null;
}

module.exports = {
  getInstance,
  resetInstance
};