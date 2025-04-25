import axios from 'axios';
import { pool } from '../db';
import { getEnv } from '../constants/env';
import { API } from '../constants/api';

const CURRENCY_API_KEY = getEnv('CURRENCY_API_KEY');
const BASE_URL = API.CURRENCY;

interface CurrencyRate {
  code: string;
  value: number;
}

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

export async function getLatestRateToPKR(code: string, date?: string): Promise<number> {
  const target = code.toUpperCase();
  const base = 'PKR';

  const today = new Date().toISOString().split('T')[0];
  let effectiveDate = date || today;

  const isToday = effectiveDate === today;
  if (isToday) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    effectiveDate = yesterday.toISOString().split('T')[0];
  }

  try {
    const local = await pool.query(
      `SELECT exchange_rate FROM currency_exchange_history
       WHERE base_currency=$1 AND target_currency=$2 AND rate_date <= $3
       ORDER BY rate_date DESC LIMIT 1`,
      [base, target, effectiveDate]
    );
    if (local.rowCount) return local.rows[0].exchange_rate;
  } catch (e: any) {
    
  }

  const [rate] = await convertCurrency(1, base, [target], effectiveDate);
  return rate.value;
}

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

export async function convertCurrency(value: number, base: string, targets: string[], date?: string): Promise<CurrencyRate[]> {
  let result: CurrencyRate[] = [];

  const isToday = !date || new Date(date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
  const endpoint = `${BASE_URL}/latest`;
  const base_currency = base.toUpperCase();

  try {
    const res = await axios.get(endpoint, {
      params: {
        apikey: CURRENCY_API_KEY,
        base_currency,
        currencies: targets.join(',')
      }
    });

    const rates = res.data.data;

    for (const code of targets) {
      const targetRate = rates[code.toUpperCase()];
      if (!targetRate) continue;

      const converted = value / targetRate.value;
      result.push({ code, value: converted });
    }


  } catch (e: any) {

  }

  return result;
}
