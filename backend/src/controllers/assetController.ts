// backend/src/controllers/assetController.ts
import { Request, Response } from 'express';
import * as svc from '../services/assetService';
import { AssetType } from '../constants/assets';

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
    const asset = await svc.createAsset(userId, dto);
    res.status(201).json(asset);
  } catch (e:any) {
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
    // you may accept query params unit & currency if desired
    const { unit='GRAM', currency='PKR' } = req.query as any;
    res.json(await svc.getGoldHistory(unit, currency));
  } catch (e:any) {
    res.status(e.status||500).json({ error: e.message });
  }
}
