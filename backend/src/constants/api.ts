import { getEnv } from './env';

const RAPIDAPI_HOST = getEnv('RAPIDAPI_HOST');
const POLYGON_API_KEY = getEnv('POLYGON_API_KEY');

export const API = {
  GOLD: {
    LIVE:    `https://${RAPIDAPI_HOST}/live`,
    HISTORY: `https://${RAPIDAPI_HOST}/history`,
  },
  STOCK: {
    // Gets previous day close
    PREV_CLOSE: (ticker: string) =>
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev`,

    // Historical OHLC (custom range)
    RANGE: (ticker: string, timespan: string, from: string, to: string) =>
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/${timespan}/${from}/${to}`,

    // Open/Close for specific day
    OPEN_CLOSE: `https://api.polygon.io/v1/open-close`,

    // Search or autocomplete tickers
    SEARCH_TICKERS: `https://api.polygon.io/v3/reference/tickers`
  }
};
