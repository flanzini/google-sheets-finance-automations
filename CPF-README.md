# Crypto Price Fetcher (Google Apps Script)

Google Apps Script function that fetches live cryptocurrency prices from the
CoinMarketCap API and returns them into Google Sheets.

I built this to track crypto holdings in my personal finance dashboard
without manual updates.

## Features

- Fetches live EUR-denominated prices from CoinMarketCap.
- Usable directly inside Google Sheets as a custom function:
  ```excel
  =GET_CRYPTO_PRICE("BTC")
  =GET_CRYPTO_PRICE("ETH")
  ```
- Handles missing tickers and invalid responses gracefully.

## Setup

1. Get an API key from https://coinmarketcap.com/api/
2. In Apps Script:
   - Open **Project Settings → Script properties**
   - Add:
     - `CMC_KEY = your-api-key`
3. Paste `Code.gs` into your Apps Script project.
4. Use the `GET_CRYPTO_PRICE` function in your sheet.

## Notes

- Do not hard-code your API key in the script; always use Script Properties.
- Google Sheets custom functions are subject to quotas and execution
  limits; use sparingly in large spreadsheets.

## Disclaimer

Provided for personal finance tracking and educational use only.
