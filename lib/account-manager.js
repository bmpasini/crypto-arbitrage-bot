'use strict';

const ExchangesManager = require('./exchanges-manager');

class AccountManager {
  constructor(settings) {
    this.exchangesManager = ExchangesManager.getInstance(settings);
    this.accountBalances = {};
  }


}