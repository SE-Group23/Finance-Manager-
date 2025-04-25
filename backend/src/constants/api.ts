import { getEnv } from './env';

const RAPIDAPI_HOST = getEnv('RAPIDAPI_HOST');
const POLYGON_API_KEY = getEnv('POLYGON_API_KEY');

export const API = {
  GOLD: {
    LIVE:    `https://${RAPIDAPI_HOST}/live`,
    HISTORY: `https://${RAPIDAPI_HOST}/history`,
  },
  STOCK: {
    PREV_CLOSE: (ticker: string) =>
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev`,

    RANGE: (ticker: string, timespan: string, from: string, to: string) =>
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/${timespan}/${from}/${to}`,

    OPEN_CLOSE: `https://api.polygon.io/v1/open-close`,

    SEARCH_TICKERS: `https://api.polygon.io/v3/reference/tickers`
  },
  CURRENCY: 'https://api.currencyapi.com/v3'
};
