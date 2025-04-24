import axios from 'axios';
import { pool } from '../db';
import { getEnv } from '../constants/env';

const CURRENCY_API_KEY = getEnv('CURRENCY_API_KEY');
const BASE_URL = 'https://api.currencyapi.com/v3';

interface CurrencyRate {
  code: string;
  value: number;
}

/** Fetch and store supported currencies */
export async function syncSupportedCurrencies(): Promise<void> {
  const res = await axios.get(`${BASE_URL}/currencies`, {
    headers: { apikey: CURRENCY_API_KEY }
  });

  const data = res.data.data;
  for (const code in data) {
    const cur = data[code];
    await pool.query(`
      INSERT INTO currencies (currency_code, name, symbol, native_symbol, decimal_digits, rounding, name_plural, type)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (currency_code) DO UPDATE SET
        name = EXCLUDED.name,
        symbol = EXCLUDED.symbol,
        native_symbol = EXCLUDED.native_symbol,
        decimal_digits = EXCLUDED.decimal_digits,
        rounding = EXCLUDED.rounding,
        name_plural = EXCLUDED.name_plural,
        type = EXCLUDED.type
    `, [
      cur.code,
      cur.name,
      cur.symbol,
      cur.symbol_native,
      cur.decimal_digits,
      cur.rounding,
      cur.name_plural,
      cur.type
    ]);
  }
}

/** Fetch and return today's exchange rates */
export async function getLatestRates(base: string = 'USD', targets: string[] = ['EUR', 'PKR']): Promise<CurrencyRate[]> {
  const res = await axios.get(`${BASE_URL}/latest`, {
    params: {
      apikey: CURRENCY_API_KEY,
      base_currency: base,
      currencies: targets.join(',')
    }
  });

  const result: CurrencyRate[] = [];
  for (const code in res.data.data) {
    result.push({ code, value: res.data.data[code].value });
  }
  return result;
}

/** Fetch and store exchange rates for a given date */
export async function getHistoricalRates(date: string, base: string = 'USD', targets: string[] = ['PKR', 'EUR']): Promise<void> {
  const res = await axios.get(`${BASE_URL}/historical`, {
    params: {
      apikey: CURRENCY_API_KEY,
      date,
      base_currency: base,
      currencies: targets.join(',')
    }
  });

  const data = res.data.data;
  for (const target in data) {
    const rate = data[target].value;
    await pool.query(`
      INSERT INTO currency_exchange_history (base_currency, target_currency, rate_date, exchange_rate)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (base_currency, target_currency, rate_date) DO UPDATE SET exchange_rate = EXCLUDED.exchange_rate
    `, [base, target, date, rate]);
  }
}

/** Get exchange rates for a range (charting) */
export async function getRangeRates(
  base: string,
  targets: string[],
  from: string,
  to: string,
  accuracy: 'day' | 'hour' = 'day'
): Promise<{ datetime: string; data: Record<string, CurrencyRate> }[]> {
  const res = await axios.get(`${BASE_URL}/range`, {
    params: {
      apikey: CURRENCY_API_KEY,
      datetime_start: `${from}T00:00:00Z`,
      datetime_end: `${to}T23:59:59Z`,
      accuracy,
      base_currency: base,
      currencies: targets.join(',')
    }
  });

  return res.data.data;
}

/** Convert amount using today's or historical rates */
export async function convertCurrency(
  value: number,
  base: string,
  targets: string[],
  date?: string
): Promise<CurrencyRate[]> {
  const res = await axios.get(`${BASE_URL}/convert`, {
    params: {
      apikey: CURRENCY_API_KEY,
      value,
      base_currency: base,
      currencies: targets.join(','),
      date
    }
  });

  const result: CurrencyRate[] = [];
  for (const code in res.data.data) {
    result.push({ code, value: res.data.data[code].value });
  }
  return result;
}
