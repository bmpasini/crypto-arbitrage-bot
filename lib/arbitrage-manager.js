'use strict';

const ExchangesManager = require('./exchanges-manager');

class ArbitrageManager {
  constructor(settings) {
    this.exchangesManager = ExchangesManager.getInstance(settings);
  }

  findSpread(prices) {
    console.log('prices', prices);
    const spreads = {
      viable: false,
      trades: {} // {coin: {}}
    };
    const fees = this._getFees();
    for (const coinName in prices) {
      const exchangePrices = prices[coinName];
      const coinResults = this._analizePrices(exchangePrices, fees);
      if (coinResults.viable) {
        spreads.viable = true,
        spreads.trades[coinName] = coinResults.tradeData
      }
    }
    return spreads;
  }

  _analizePrices(exchangePrices, fees) {
    const candidates = this._findCandidates(exchangePrices, fees);
    const lowest = candidates.lowest;
    const highest = candidates.highest;
    const spread = this._computeSpread(lowest, highest, fees);

    const results = {
      viable: false,
      tradeData: {
        buyPrice: lowest.price,
        buyExchange: lowest.exchangeName,
        buyFee: fees[lowest.exchangeName],
        buyFinalPrice: lowest.finalPrice,
        sellPrice: highest.price,
        sellExchange: highest.exchangeName,
        sellFee: fees[highest.exchangeName],
        sellFinalPrice: highest.finalPrice,
        spread: spread
      }
    };

    if (spread > 0) {
      results.viable = true;
    }

    // console.log('ALL RESULTS:', results);

    return results;
  }

  // better not cache this here and ideally get it every time from server before opening a trade order
  _getFees() {
    let fees = {};
    const exchanges = this.exchangesManager.getExchanges();
    for (const exchangeName in exchanges) {
      console.log('exchangeName', exchangeName)
      const fee = this.exchangesManager.getFees(exchangeName);
      fees[exchangeName] = fee;
    }
    return fees;
  }

  // verificar essa conta (acho que está certo agora)
  _findCandidates(exchangePrices, fees) {
    let lowest = {
      price: Number.MAX_SAFE_INTEGER,
      finalPrice: Number.MAX_SAFE_INTEGER,
      exchangeName: null
    };
    let highest = {
      price: 0,
      finalPrice: 0,
      exchangeName: null
    }  
    for (const exchangeName in exchangePrices) {
      const coinPrice = exchangePrices[exchangeName];
      const bidPrice = coinPrice.bidPrice; // sell to highest bider
      const askPrice = coinPrice.askPrice; // buy from lowest asker
      const fee = fees[exchangeName];
      const buyPrice = askPrice / (1 - fee);
      const sellPrice = bidPrice * (1 - fee);
      if (buyPrice < lowest.finalPrice) {
        lowest.price = askPrice;
        lowest.finalPrice = buyPrice;
        lowest.exchangeName = exchangeName;
      }
      if (sellPrice > highest.finalPrice) {
        highest.price = bidPrice;
        highest.finalPrice = sellPrice;
        highest.exchangeName = exchangeName;
      }
    }

    return { lowest, highest };
  }

  // (q/p)(1-f)(1-g) - 1
  _computeSpread(lowest, highest, fees) {
    const buyPrice = lowest.price;
    const sellPrice = highest.price;
    const buyFee = fees[lowest.exchangeName];
    const sellFee = fees[highest.exchangeName];
    // console.log('isCorrect', ((sellPrice / buyPrice) * (1 - buyFee) * (1 - sellFee) - 1) - (highest.finalPrice/lowest.finalPrice - 1))
    return ((sellPrice / buyPrice) * (1 - buyFee) * (1 - sellFee) - 1);
  }
}

let instance;

function getInstance(settings) {
  if (!instance) {
    instance = new ArbitrageManager(settings);
  }
  return instance;
}

function resetInstance() {
  instance = null;
}

module.exports = {
  getInstance,
  resetInstance
}