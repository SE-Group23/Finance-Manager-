import { getEnv } from './env';

const RAPIDAPI_HOST = getEnv('RAPIDAPI_HOST');

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
  },
};
