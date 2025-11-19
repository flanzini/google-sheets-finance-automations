function sendAndReceiveFlexRequest() {
  var FLEX_TOKEN = PropertiesService.getScriptProperties().getProperty('FLEX_TOKEN');
  var FLEX_QUERY_ID = PropertiesService.getScriptProperties().getProperty('FLEX_QUERY_ID');
  var SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  var SHEET_NAME = PropertiesService.getScriptProperties().getProperty('SHEET_NAME') || 'IBKR Hist. Transactions';

  if (!FLEX_TOKEN || !FLEX_QUERY_ID || !SPREADSHEET_ID) {
    Logger.log("Missing one or more Script Properties (FLEX_TOKEN, FLEX_QUERY_ID, SPREADSHEET_ID).");
    return;
  }

  var sendUrl = "https://gdcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest?";
  var version = "&v=3";
  var requestUrl = sendUrl + FLEX_TOKEN + FLEX_QUERY_ID + version;

  var response = UrlFetchApp.fetch(requestUrl);
  if (response.getResponseCode() !== 200) {
    Logger.log("Error in SendRequest: " + response.getContentText());
    return;
  }

  var xml = response.getContentText();
  var document = XmlService.parse(xml);
  var root = document.getRootElement();

  var getUrl = root.getChild('Url').getText();
  var refCode = "&q=" + root.getChild('ReferenceCode').getText();
  var receiveUrl = getUrl + "?" + FLEX_TOKEN + refCode + version;

  Logger.log("Waiting for Flex report generation...");
  Utilities.sleep(20000);

  var receiveResponse = UrlFetchApp.fetch(receiveUrl, { 'followRedirects': true });
  var finalData = receiveResponse.getContentText();

  processTradesXML(finalData, SPREADSHEET_ID, SHEET_NAME);
}

function parseEuropeanDate(dateStr) {
  if (!dateStr) return new Date('Invalid Date');
  if (Object.prototype.toString.call(dateStr) === '[object Date]') return dateStr;
  var parts = String(dateStr).split('/');
  if (parts.length !== 3) return new Date('Invalid Date');
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

function parseUSDate(dateStr) {
  if (!dateStr) return new Date('Invalid Date');
  if (Object.prototype.toString.call(dateStr) === '[object Date]') return dateStr;
  var parts = String(dateStr).split('/');
  if (parts.length !== 3) return new Date('Invalid Date');
  return new Date(parts[2], parts[0] - 1, parts[1]);
}

function processTradesXML(xmlString, spreadsheetId, sheetName) {
  var document = XmlService.parse(xmlString);
  var root = document.getRootElement();

  var trades = root.getChild('FlexStatements')
                   .getChild('FlexStatement')
                   .getChild('Trades')
                   .getChildren('Trade');

  var data = [];
  data.push(['Currency', 'Asset Category', 'Symbol', 'Trade Date', 'Quantity', 'Trade Price', 'IB Commission', 'Cost']);

  for (var i = 0; i < trades.length; i++) {
    var trade = trades[i];

    var currency = trade.getAttribute('currency').getValue();
    var assetCategory = trade.getAttribute('assetCategory').getValue();
    var symbol = trade.getAttribute('symbol').getValue();

    var rawDate = trade.getAttribute('tradeDate').getValue();
    var tradeDateObj = parseEuropeanDate(rawDate);
    var formattedDate = Utilities.formatDate(tradeDateObj, Session.getScriptTimeZone(), "MM/dd/yyyy");

    var quantity = trade.getAttribute('quantity').getValue();
    var tradePrice = trade.getAttribute('tradePrice').getValue();
    var ibCommission = trade.getAttribute('ibCommission').getValue();
    var cost = trade.getAttribute('cost').getValue();

    data.push([currency, assetCategory, symbol, formattedDate, quantity, tradePrice, ibCommission, cost]);
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  var existingData = sheet.getDataRange().getValues();

  var cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

  var filteredData = existingData.filter(function(row, index) {
    if (index === 0) return true;
    var tradeDate = parseUSDate(row[3]);
    return tradeDate < cutoffDate;
  });

  var seen = new Set();
  var combinedData = [filteredData[0]];
  var allRows = filteredData.slice(1).concat(data.slice(1));

  for (var j = 0; j < allRows.length; j++) {
    var row = allRows[j];
    var key = row[2] + "|" + row[3] + "|" + row[4] + "|" + row[5];
    if (!seen.has(key)) {
      combinedData.push(row);
      seen.add(key);
    }
  }

  combinedData.sort(function(a, b) {
    if (a[0] === 'Currency') return -1;
    var dateA = parseUSDate(a[3]);
    var dateB = parseUSDate(b[3]);
    return dateA - dateB;
  });

  sheet.clearContents();
  sheet.getRange(1, 1, combinedData.length, combinedData[0].length).setValues(combinedData);

  Logger.log("Data written. Total rows (excluding header): " + (combinedData.length - 1));
}

function updateIbkrTrades() {
  sendAndReceiveFlexRequest();
}
