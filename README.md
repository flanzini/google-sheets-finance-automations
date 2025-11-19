# Google Sheets Finance Automations

A collection of Google Apps Script tools that automate repetitive personal-finance
workflows inside Google Sheets.

## Included Automations

### 1. IBKR Flex Trades Downloader (`ibkr-flex-downloader/`)

Downloads, parses, deduplicates, and updates a trades ledger in Google Sheets
using the Interactive Brokers Flex Web Service API.

### 2. Crypto Price Fetcher (`crypto-price-fetcher/`)

Custom Sheets function `GET_CRYPTO_PRICE(ticker)` that returns live cryptocurrency
prices in EUR via the CoinMarketCap API.

## Notes

- All secrets (API keys, tokens, IDs) must be stored in Apps Script Script Properties.
- Example code is provided for educational purposes; review and adapt before using
  it with your own production setup.
