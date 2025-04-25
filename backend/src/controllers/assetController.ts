// backend/src/controllers/assetController.ts
import { Request, Response } from 'express';
import * as svc from '../services/assetService';
import { GoldUnit, Currency } from '../constants/assets';
import * as stockService from '../services/stockService';

export async function getUserAssets(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    res.json(await svc.fetchUserAssets(userId));
  } catch (e:any) {
    res.status(e.status||500).json({ error: e.message });
  }
}

export async function createAsset(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const dto = req.body;

    console.log("Incoming asset DTO:", dto);
    
    const asset = await svc.createAsset(userId, dto);
    res.status(201).json(asset);
  } catch (e:any) {
    console.error("❌ Error creating asset:", e.message);
    res.status(e.status||500).json({ error: e.message });
  }
}

export async function updateAsset(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const dto = { ...req.body, assetId: Number(req.params.id) };
    res.json(await svc.updateAsset(userId, dto));
  } catch (e:any) {
    res.status(e.status||500).json({ error: e.message });
  }
}

export async function deleteAsset(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    await svc.deleteAsset(userId, Number(req.params.id));
    res.status(204).send();
  } catch (e:any) {
    res.status(e.status||500).json({ error: e.message });
  }
}

export async function refreshAssetValues(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    res.json(await svc.refreshAssetValues(userId));
  } catch (e:any) {
    res.status(e.status||500).json({ error: e.message });
  }
}

export async function getPortfolioSummary(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    res.json(await svc.getPortfolioSummary(userId));
  } catch (e:any) {
    res.status(e.status||500).json({ error: e.message });
  }
}

export async function getGoldHistory(req: Request, res: Response) {
  try {
    const unit = "tola"
    const currency = "PKR"

    console.log(`[getGoldHistory] unit=${unit}, currency=${currency}`);

    res.json(await svc.getGoldHistory(unit, currency));
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message });
  }
}

export async function getStockHistory(req: Request, res: Response): Promise<void> {
  try {
    const ticker = req.params.ticker;
    const { from, to, timespan } = req.query as Record<string, string>;

    if (!from || !to) {
      res.status(400).json({ error: "'from' and 'to' query params are required" });
      return;
    }

    const data = await stockService.getHistoricalStockPrices(ticker, from, to, timespan || 'day');
    res.json(data);
  } catch (err: any) {
    console.error("Error fetching stock history:", err.message);
    res.status(500).json({ error: "Failed to fetch stock history." });
  }
}
