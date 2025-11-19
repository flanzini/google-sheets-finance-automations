function GET_CRYPTO_PRICE(ticker) { 
  if (!ticker) {
    return "Error: No ticker provided";
  }

  var apiKey = PropertiesService.getScriptProperties().getProperty('CMC_KEY');
  if (!apiKey) {
    return "Error: API key not set";
  }

  var url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
            + "?symbol=" + encodeURIComponent(ticker)
            + "&convert=EUR";

  var options = {
    method: "get",
    headers: {
      "X-CMC_PRO_API_KEY": apiKey
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());

    if (!data.data || !data.data[ticker] || !data.data[ticker].quote || !data.data[ticker].quote.EUR) {
      return "Error: Invalid API response";
    }

    var price = data.data[ticker].quote.EUR.price;
    return parseFloat(price.toFixed(2));

  } catch (e) {
    Logger.log("API request failed: " + e.toString());
    return "Error: API request failed";
  }
}
