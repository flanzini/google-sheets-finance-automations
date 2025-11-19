# IBKR Flex Trades Downloader

Google Apps Script that:
- Requests an Interactive Brokers Flex report,
- Parses the returned XML,
- Cleans and deduplicates trades,
- Writes them to a Google Sheet in a consistent tabular format.

I built this to avoid manually downloading and importing trades from IBKR
into my portfolio tracking spreadsheet.

## What it does

- Calls IBKR's Flex Web Service (`SendRequest` + `GetStatement`)
- Waits briefly for the report to be generated
- Parses `<Trade>` elements from the XML
- Normalizes trade dates, quantities, prices, and commissions
- Deduplicates rows based on `Symbol | Date | Quantity | Trade Price`
- Keeps only the last 12 months of trades
- Sorts trades by date and writes them into a sheet
  (default name: `IBKR Hist. Transactions`)

## Setup

1. Create a Flex Query in your IBKR account (Trades report) and enable
   the Flex Web Service.
2. Copy:
   - Flex token
   - Flex query ID
3. In Google Sheets:
   - Create a spreadsheet and (optionally) a sheet named
     `IBKR Hist. Transactions`.
   - Open **Extensions → Apps Script** and paste `Code.gs`.
4. In Apps Script:
   - Go to **Project Settings → Script properties** and add:
     - `FLEX_TOKEN = t=...`
     - `FLEX_QUERY_ID = &q=...`
     - `SPREADSHEET_ID = your-sheet-id`
     - (Optional) `SHEET_NAME = IBKR Hist. Transactions`
5. Run `updateIbkrTrades()` once and authorize the script.

## Notes

- This script is intended for personal portfolio tracking.
- Always verify the output before using it for tax or compliance purposes.
