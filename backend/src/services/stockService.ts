import axios from 'axios';
import { pool } from '../db';
import { API } from '../constants/api';
import { getEnv } from '../constants/env';
import { getAssetTypeId } from './assetService';
import { AssetType } from '../constants/assets';

const POLYGON_API_KEY = getEnv('POLYGON_API_KEY');

export interface StockPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TickerMeta {
  ticker: string;
  name: string;
  market?: string;
  currency?: string;
  active?: boolean;
}

export async function getTickerMeta(ticker: string): Promise<TickerMeta | null> {
  const assetTypeId = await getAssetTypeId(AssetType.STOCK);

  // Look in DB first
  const cached = await pool.query(
    `SELECT ticker, company_name AS name, currency_code AS currency
     FROM asset_metadata
     WHERE asset_type_id = $1 AND ticker = $2`,
    [assetTypeId, ticker]
  );

  if ((cached.rowCount ?? 0) > 0) return cached.rows[0];

  // Fetch from Polygon if not cached
  const res = await axios.get(API.STOCK.SEARCH_TICKERS, {
    params: {
      ticker,
      market: 'stocks',
      limit: 1,
      active: true,
      apiKey: POLYGON_API_KEY,
    }
  });

  const match = res.data.results?.[0];
  if (!match) return null;

  // Insert into asset_metadata
  await pool.query(`
    INSERT INTO asset_metadata (asset_type_id, ticker, company_name, currency_code)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (ticker, currency_code, unit)
    DO UPDATE SET company_name = EXCLUDED.company_name, currency_code = EXCLUDED.currency_code
  `, [
    assetTypeId,
    match.ticker,
    match.name,
    match.currency_name
  ]);

  return {
    ticker: match.ticker,
    name: match.name,
    currency: match.currency_name,
    market: match.market,
    active: match.active
  };
}

function getValidStockDate(acquiredOn: string): string {
  const inputDate = new Date(acquiredOn);
  const today = new Date();

  // Only compare date parts
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (inputDate >= today) {
    // If acquisition date is today or future, fallback to yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  } else {
    return acquiredOn;
  }
}

export async function getStockCurrentValue(ticker: string, quantity: number, acquisitionDate: string): Promise<number> {
  const priceDate = getValidStockDate(acquisitionDate);
  console.log(`[getStockCurrentValue] ${ticker} (target date: ${priceDate})`);

  try {
    console.log(`[getStockCurrentValue] Checking DB for ${ticker}...`);
    const existing = await pool.query(
      `SELECT close FROM stock_price_history WHERE ticker = $1 AND price_date = $2`,
      [ticker, priceDate]
    );
    if (existing.rowCount) return existing.rows[0].close * quantity;
  } catch (e: any) {
    console.error("Error checking DB for stock value:", e.message);
  }

  console.log(`[getStockCurrentValue] Fetching current value from API for ${ticker}...`);

  let ret = 0;
  try {
    const url = `${API.STOCK.OPEN_CLOSE}/${ticker}/${priceDate}`;
    const res = await axios.get(url, { params: { adjusted: true, apiKey: POLYGON_API_KEY } });

    const { open, close, high, low, volume } = res.data;
    console.log(`[getStockCurrentValue] API data for ${ticker} - close: ${close}`);

    try {
      await pool.query(
        `INSERT INTO stock_price_history (ticker, price_date, open, high, low, close, volume)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (ticker, price_date) DO UPDATE
         SET open = EXCLUDED.open, high = EXCLUDED.high, low = EXCLUDED.low, close = EXCLUDED.close, volume = EXCLUDED.volume`,
        [ticker, priceDate, open, high, low, close, volume]
      );
    } catch (e: any) {
      console.error("Error inserting stock current value into DB:", e.message);
    }

    ret = close * quantity;
  } catch (e: any) {
    console.error("Error fetching stock current value:", e.message);
  }

  return ret;
}


/** Fetch & insert historical prices */
export async function getHistoricalStockPrices(
  ticker: string,
  from: string,
  to: string,
  timespan: string = 'day'
): Promise<StockPoint[]> {
  const res = await axios.get(API.STOCK.RANGE(ticker, timespan, from, to), {
    params: {
      adjusted: true,
      sort: 'asc',
      apiKey: POLYGON_API_KEY
    }
  });

  const points: StockPoint[] = res.data.results.map((item: any) => ({
    date: new Date(item.t).toISOString().slice(0, 10),
    open: item.o,
    high: item.h,
    low: item.l,
    close: item.c,
    volume: item.v,
  }));

  for (const p of points) {
    await pool.query(
      `INSERT INTO stock_price_history(ticker, price_date, open, high, low, close, volume)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (ticker, price_date) DO UPDATE SET
         open = EXCLUDED.open, high = EXCLUDED.high, low = EXCLUDED.low,
         close = EXCLUDED.close, volume = EXCLUDED.volume`,
      [ticker, p.date, p.open, p.high, p.low, p.close, p.volume]
    );
  }

  return points;
}

/** Helper: fuzzy search from name */
export async function searchTickerByName(input: string): Promise<TickerMeta[]> {
  const res = await axios.get(API.STOCK.SEARCH_TICKERS, {
    params: {
      search: input,
      market: 'stocks',
      limit: 5,
      active: true,
      apiKey: POLYGON_API_KEY
    }
  });

  const matches: TickerMeta[] = res.data.results?.map((r: any) => ({
    ticker: r.ticker,
    name: r.name,
    market: r.market,
    currency: r.currency_name,
    active: r.active
  })) ?? [];

  return matches;
}
