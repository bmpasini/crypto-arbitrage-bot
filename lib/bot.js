'use strict';

const Promise = require('bluebird');
const ExchangesManager = require('./exchanges-manager');
const ArbitrageManager = require('./arbitrage-manager');
const settings = require('./settings');

class Bot {

  constructor() {
    this.exchangesManager = ExchangesManager.getInstance(settings);
    this.arbitrageManager = ArbitrageManager.getInstance(settings);
  }

  getUpdatedPrices() { // async
    return this.exchangesManager.getUpdatedPrices();
  }

  findSpread() {
    return this.getUpdatedPrices()
      .then(prices => this.arbitrageManager.findSpread(prices))
      .then(results => {
        console.log('results', results);
      });
  }
}

const bot = new Bot();
bot.findSpread();
