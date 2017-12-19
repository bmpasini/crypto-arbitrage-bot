'use strict';

const Promise = require('bluebird');
const request = require('request');

function getExchangeMarketSummary(url, exchangeName) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (error) {
        console.log("Request error: %j", error);
        return reject(error);
      }
      try {
        let apiResponse = JSON.parse(body);
        console.log("Queried %s successfully", exchangeName);
        // console.log('apiResponse', apiResponse);
        return resolve(apiResponse);
      } catch (err) {
        console.log("Error getting JSON response from", url, err); //Throws error
        reject(err);
      }
    });
  });
}

module.exports = {
  getExchangeMarketSummary
}