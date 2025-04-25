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
  getStockHistory
} from '../controllers/assetController';

const router = Router();

router.get('/', requireAuth, getUserAssets);

router.get('/summary', requireAuth, getPortfolioSummary);

router.post('/', requireAuth, createAsset);

router.put('/:id', requireAuth, updateAsset);

router.delete('/:id', requireAuth, deleteAsset);

router.post('/refresh', requireAuth, refreshAssetValues);

router.get('/history/gold', requireAuth, getGoldHistory);

router.get('/history/stock/:ticker', requireAuth, getStockHistory);

export default router;
