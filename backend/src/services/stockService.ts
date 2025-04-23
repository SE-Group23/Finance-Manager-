import axios from 'axios';
import { getEnv } from '../constants/env';
import { API } from '../constants/api';

const POLYGON_API_KEY = getEnv('POLYGON_API_KEY');

export interface StockPoint {
  date:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export async function getStockCurrentValue(ticker: string, qty: number): Promise<number> {
  const resp = await axios.get<{ results: { c: number }[] }>(
    API.STOCK.PREV_CLOSE(ticker),
    { params: { apiKey: POLYGON_API_KEY } }
  );
  const r = resp.data.results?.[0]?.c;
  if (r == null) throw new Error(`No closing price for ${ticker}`);
  return r * qty;
}

export async function getHistoricalStockPrices(
  ticker: string,
  from:   string,
  to:     string,
  timespan: string = 'day'
): Promise<StockPoint[]> {
  const resp = await axios.get<{ results: any[] }>(
    API.STOCK.RANGE(ticker, timespan, from, to),
    { params: { apiKey: POLYGON_API_KEY, sort: 'asc' } }
  );
  return resp.data.results.map(item => ({
    date:   new Date(item.t).toISOString().slice(0,10),
    open:   item.o,
    high:   item.h,
    low:    item.l,
    close:  item.c,
    volume: item.v,
  }));
}
