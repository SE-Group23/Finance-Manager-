import axios from 'axios';
import { pool } from '../db';
import { getEnv } from '../constants/env';
import { API } from '../constants/api';
import { GoldUnit, Currency } from '../constants/assets';

export interface GoldPoint {
  date: string;
  price: number;
}

const RAPIDAPI_KEY = getEnv('RAPIDAPI_KEY');
const RAPIDAPI_HOST = getEnv('RAPIDAPI_HOST');

// Fetch from RapidAPI (Live price)
async function fetchLive(unit: "tola", currency: "PKR"): Promise<number> {
  try {
    const resp = await axios.get(API.GOLD.LIVE, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      params: { unit, currency }
    });

    const data = resp.data;

    // Based on your sample: "1 Tola": [...]
    const priceArray = data["1 Tola"];
    if (!Array.isArray(priceArray) || priceArray.length === 0) {
      throw new Error("Missing or invalid price data for 1 Tola");
    }

    const price = priceArray[0];
    if (typeof price !== 'number' || isNaN(price)) {
      throw new Error("Invalid price format");
    }

    console.log("📡 Live price (1 Tola):", price);
    return price;
  } catch (err: any) {
    console.error("🚨 Gold API failed:", err.response?.data || err.message);
    throw new Error("Gold price service temporarily unavailable (rate limit or error).");
  }
}


// Try from DB first, fall back to live fetch
export async function getLatestGoldPrice(unit: "tola", currency: "PKR"): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD


    console.log("Date:", today);

    const result = await pool.query(
      `SELECT price FROM gold_price_history
      WHERE unit = $1 AND currency = $2 AND price_date = $3 LIMIT 1`,
      [unit, currency, today]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Gold price cache HIT for ${unit} in ${currency}`);
      console.log("Result from DB:", result.rows.length, "rows");
      return result.rows[0].price;
    } else {
      console.log(`🟡 Cache MISS for ${unit} in ${currency}, calling API`);
    }

    // Fetch from API and store
    const price = await fetchLive(unit, currency);
    await pool.query(
      `INSERT INTO gold_price_history (price_date, unit, currency, price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (price_date, unit, currency)
      DO UPDATE SET price = EXCLUDED.price`,
      [today, unit, currency, price]
    );

    // const price = 0

    return price;
  } catch (err: any) {
    console.error("🚨 Gold API failed:", err.response?.data || err.message);
    throw new Error("Gold price service temporarily unavailable (rate limit or error).");
  }

}

// Fetch 35-day history from RapidAPI
export async function fetchGoldHistoryFromApi(): Promise<Record<string, number>> {
  const resp = await axios.get<Record<string, number>>(API.GOLD.HISTORY, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    }
  });
  return resp.data;
}

// Ensure last 35 days are in DB (only insert missing)
export async function ensureRecentGoldHistory(unit: "tola", currency: "PKR"): Promise<void> {
  
  try{
  const { rows } = await pool.query(
    `SELECT price_date FROM gold_price_history
     WHERE unit = $1 AND currency = $2
     AND price_date >= CURRENT_DATE - INTERVAL '25 days'`,
    [unit, currency]
  );

  const existingDates = new Set(rows.map(r => r.price_date.toISOString().split('T')[0]));

  const data = await fetchGoldHistoryFromApi();

  for (const [dateStr, price] of Object.entries(data)) {
    const isoDate = new Date(dateStr).toISOString().split('T')[0];
    if (!existingDates.has(isoDate)) {
      await pool.query(
        `INSERT INTO gold_price_history (price_date, unit, currency, price)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (price_date, unit, currency)
         DO UPDATE SET price = EXCLUDED.price`,
        [isoDate, unit, currency, price]
      );
    }
  }
} catch (err: any) {
  console.error("🚨 Gold API failed:", err.response?.data || err.message);
  throw new Error("Gold price service temporarily unavailable (rate limit or error)."); 
}
}

// Utility to return historical data (already stored)
export async function getHistoricalGoldPrices(unit: "tola", currency: "PKR"): Promise<GoldPoint[]> {
  const result = await pool.query(
    `SELECT price_date, price FROM gold_price_history
     WHERE unit = $1 AND currency = $2
     ORDER BY price_date ASC`,
    [unit, currency]
  );

  return result.rows.map((row: any) => ({
    date: row.price_date.toISOString().split('T')[0],
    price: parseFloat(row.price)
  }));
}
