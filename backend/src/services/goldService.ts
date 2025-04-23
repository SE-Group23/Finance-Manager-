import axios from 'axios';
import { getEnv } from '../constants/env';
import { API } from '../constants/api';
import { GoldUnit, Currency } from '../constants/assets';

export interface GoldPoint {
  date:  string; 
  price: number;
}

const RAPIDAPI_KEY  = getEnv('RAPIDAPI_KEY');
const RAPIDAPI_HOST = getEnv('RAPIDAPI_HOST');

async function fetchLive(unit: GoldUnit, currency: Currency): Promise<number> {
  const resp = await axios.get<{ price_per_gram: number; price_per_tola?: number; price_per_ounce?: number }>(
    API.GOLD.LIVE,
    {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      params: { unit, currency }
    }
  );
  let p = resp.data.price_per_gram;
  if (unit === GoldUnit.TOLA)  p = resp.data.price_per_tola!;  
  if (unit === GoldUnit.OUNCE) p = resp.data.price_per_ounce!;
  return p;
}

export async function getLatestGoldPrice(unit: GoldUnit, currency: Currency): Promise<number> {
  return fetchLive(unit, currency);
}

export async function getHistoricalGoldPrices(): Promise<GoldPoint[]> {
  const resp = await axios.get<Record<string, number>>(
    API.GOLD.HISTORY,
    {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      }
    }
  );
  return Object.entries(resp.data)
    .map(([date, price]) => ({ date, price }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
