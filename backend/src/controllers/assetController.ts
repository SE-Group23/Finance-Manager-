// backend/src/controllers/assetController.ts

import { Request, Response } from 'express'
import * as assetService from '../services/assetService'
import { CreateAssetDTO, UpdateAssetDTO } from '../services/assetService'
import { Currency } from '../constants/assets' 

/**
 * GET /api/assets
 */
export async function getUserAssets(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const assets = await assetService.fetchUserAssets(userId)
    res.json(assets)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

/**
 * POST /api/assets
 */
export async function createAsset(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;


    // Destructure only the allowed fields
    const {
      assetType,
      quantity,
      purchaseValue,
      acquiredOn,
      assetDetails = {},
    } = req.body as CreateAssetDTO

    // Build a clean DTO
    const dto: CreateAssetDTO = {
      assetType,
      quantity,
      purchaseValue,
      acquiredOn,
      assetDetails: {
        unit:     assetDetails.unit,
        ticker:   assetDetails.ticker,
        name:     assetDetails.name,
        currency: assetDetails.currency as Currency,
        },
    }

    const asset = await assetService.createAsset(userId, dto)
    res.status(201).json(asset)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

/**
 * PUT /api/assets/:id
 */
export async function updateAsset(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const assetId = Number(req.params.id)

    const {
      assetType,
      quantity,
      purchaseValue,
      acquiredOn,
      assetDetails = {},
    } = req.body as UpdateAssetDTO

    const dto: UpdateAssetDTO = {
      assetId,
      assetType,
      quantity,
      purchaseValue,
      acquiredOn,
      assetDetails: {
        unit: assetDetails.unit,
        ticker: assetDetails.ticker,
        name:   assetDetails.name,
        currency: assetDetails.currency as Currency,
      },
    }

    const asset = await assetService.updateAsset(userId, dto)
    res.json(asset)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

/**
 * DELETE /api/assets/:id
 */
export async function deleteAsset(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const assetId = Number(req.params.id)
    await assetService.deleteAsset(userId, assetId)
    res.status(204).send()
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

/**
 * POST /api/assets/refresh
 */
export async function refreshAssetValues(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const updatedAssets = await assetService.refreshAssetValues(userId)
    res.json(updatedAssets)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

/**
 * GET /api/assets/summary
 */
export async function getPortfolioSummary(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const summary = await assetService.getPortfolioSummary(userId)
    res.json(summary)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

/**
 * GET /api/assets/history/gold
 */
export async function getGoldHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const history = await assetService.getGoldHistory(userId)
    res.json(history)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

/**
 * GET /api/assets/history/stock/:ticker
 */
export async function getStockHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const ticker   = req.params.ticker
    const { from, to, timespan } = req.query as any

    const history = await assetService.getStockHistory(
      userId,
      ticker,
      from!,
      to!,
      timespan as string | undefined
    )
    res.json(history)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
