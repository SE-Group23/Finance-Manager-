// backend/src/routes/assetRoutes.ts

import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  getUserAssets,
  getPortfolioSummary,
  createAsset,
  updateAsset,
  deleteAsset,
  refreshAssetValues,
  getGoldHistory,
} from '../controllers/assetController';

const router = Router();

// GET all assets for the user
router.get('/', requireAuth, getUserAssets);

// GET portfolio summary
router.get('/summary', requireAuth, getPortfolioSummary);

// POST: create a new asset
router.post('/', requireAuth, createAsset);

// PUT: update an existing asset by ID
router.put('/:id', requireAuth, updateAsset);

// DELETE: remove an asset by ID
router.delete('/:id', requireAuth, deleteAsset);

// POST: refresh current market values for all assets
router.post('/refresh', requireAuth, refreshAssetValues);

// GET: historical gold prices (last 35 days)
router.get('/history/gold', requireAuth, getGoldHistory);


export default router;
