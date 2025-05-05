const axios = require('axios');

let priceCache = {
  BTC: 60000,
  ETH: 3000,
  lastFetched: 0
};

async function fetchPrices() {
  const now = Date.now();
  if (now - priceCache.lastFetched < 10000) return priceCache;

  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
    priceCache.BTC = res.data.bitcoin.usd;
    priceCache.ETH = res.data.ethereum.usd;
    priceCache.lastFetched = now;
  } catch (err) {
    console.log("Failed to fetch prices. Using cached.");
  }

  return priceCache;
}

module.exports = { fetchPrices };
