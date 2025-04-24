import { pool } from '../db';
import { AssetType, GoldUnit, Currency } from '../constants/assets';
import { getLatestGoldPrice, getHistoricalGoldPrices, GoldPoint } from './goldService';
import { getStockCurrentValue, getHistoricalStockPrices, StockPoint } from './stockService';

export interface CreateAssetDTO {
  assetType:     AssetType;
  quantity:      number;
  purchaseValue: number;
  acquiredOn?:   string;
  assetDetails: {      
    unit?:         GoldUnit;
    ticker?:       string;
    name?:         string;
    currency?:     Currency; 
  };
}

export interface UpdateAssetDTO extends CreateAssetDTO {
  assetId: number;
}

export async function getAssetTypeId(assetType: string): Promise<number> {
  const sel = await pool.query(
    `SELECT asset_type_id FROM asset_types WHERE asset_type_name=$1`, [assetType]
  );
  if (sel.rowCount) return sel.rows[0].asset_type_id;
  const ins = await pool.query(
    `INSERT INTO asset_types(asset_type_name) VALUES($1) RETURNING asset_type_id`,
    [assetType]
  );
  return ins.rows[0].asset_type_id;
}

export async function fetchUserAssets(userId: number) {
  const { rows } = await pool.query(
    `SELECT a.*, at.asset_type_name as asset_type
     FROM assets a
     JOIN asset_types at ON a.asset_type_id = at.asset_type_id
     WHERE a.user_id = $1
     ORDER BY a.acquired_on DESC`,
    [userId]
  );
  return rows;
}

export async function createAsset(userId: number, dto: CreateAssetDTO) {
  const typeId = await getAssetTypeId(dto.assetType);
  let current = dto.purchaseValue;

  try {
    if (
      dto.assetType === AssetType.GOLD &&
      dto.assetDetails.unit &&
      dto.assetDetails.currency
    ) {
      // getLatestGoldPrice returns a number directly
      const livePrice = await getLatestGoldPrice(
        dto.assetDetails.unit,
        dto.assetDetails.currency
      );
      current = livePrice * dto.quantity;
    } else if (
      dto.assetType === AssetType.STOCK &&
      dto.assetDetails.ticker
    ) {
      // ticker is guaranteed to be a string here
      current = await getStockCurrentValue(
        dto.assetDetails.ticker,
        dto.quantity
      );
    }
  } catch {
    // fallback to purchaseValue
  }

  const { rows } = await pool.query(
    `INSERT INTO assets(user_id,asset_type_id,quantity,purchase_value,current_value,acquired_on,asset_details)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      userId,
      typeId,
      dto.quantity,
      dto.purchaseValue,
      current,
      dto.acquiredOn ? new Date(dto.acquiredOn) : new Date(),
      dto.assetDetails,
    ]
  );

  const asset = rows[0];
  // …history insertion…
  return asset;
}

export async function updateAsset(userId: number, dto: UpdateAssetDTO) {
  const typeId = await getAssetTypeId(dto.assetType);
  let current = dto.purchaseValue;

  try {
    if (
      dto.assetType === AssetType.GOLD &&
      dto.assetDetails.unit &&
      dto.assetDetails.currency
    ) {
      const livePrice = await getLatestGoldPrice(
        dto.assetDetails.unit,
        dto.assetDetails.currency
      );
      current = livePrice * dto.quantity;
    } else if (
      dto.assetType === AssetType.STOCK &&
      dto.assetDetails.ticker
    ) {
      current = await getStockCurrentValue(
        dto.assetDetails.ticker,
        dto.quantity
      );
    }
  } catch {
    // fallback
  }

  const { rowCount, rows } = await pool.query(
    `UPDATE assets SET
       asset_type_id=$1,
       quantity=$2,
       purchase_value=$3,
       current_value=$4,
       acquired_on=$5,
       asset_details=$6,
       updated_at=NOW()
     WHERE asset_id=$7 AND user_id=$8
     RETURNING *`,
    [
      typeId,
      dto.quantity,
      dto.purchaseValue,
      current,
      dto.acquiredOn ? new Date(dto.acquiredOn) : new Date(),
      dto.assetDetails,
      dto.assetId,
      userId,
    ]
  );

  if (!rowCount) throw Object.assign(new Error('Asset not found'), { status: 404 });
  // …history insertion…
  return rows[0];
}

export async function refreshAssetValues(userId: number) {
  const assets = await fetchUserAssets(userId);
  await Promise.all(
    assets.map(async (a) => {
      let cv = a.purchase_value as number;
      try {
        if (
          a.asset_type === AssetType.GOLD &&
          a.asset_details.unit &&
          a.asset_details.currency
        ) {
          const live = await getLatestGoldPrice(
            a.asset_details.unit,
            a.asset_details.currency
          );
          cv = live * a.quantity;
        } else if (
          a.asset_type === AssetType.STOCK &&
          a.asset_details.ticker
        ) {
          cv = await getStockCurrentValue(
            a.asset_details.ticker,
            a.quantity
          );
        }
        await pool.query(
          `UPDATE assets SET current_value=$1, updated_at=NOW() WHERE asset_id=$2`,
          [cv, a.asset_id]
        );
        // …history…
      } catch {
        // skip this asset on failure
      }
    })
  );
  return fetchUserAssets(userId);
}

export async function deleteAsset(userId: number, assetId: number) {
  const { rowCount } = await pool.query(
    `DELETE FROM assets WHERE asset_id=$1 AND user_id=$2`,
    [assetId, userId]
  );
  if (!rowCount) throw Object.assign(new Error('Asset not found'), { status: 404 });
}

export async function getPortfolioSummary(userId: number) {
  const [{ total_current, total_purchase }] = (await pool.query(
    `SELECT SUM(current_value)::float as total_current,
            SUM(purchase_value)::float as total_purchase
     FROM assets WHERE user_id=$1`,
    [userId]
  )).rows;
  const dist = (await pool.query(
    `SELECT at.asset_type_name as asset_type,
            COUNT(*) as count,
            SUM(a.current_value)::float as total
     FROM assets a
     JOIN asset_types at ON a.asset_type_id=at.asset_type_id
     WHERE a.user_id=$1
     GROUP BY at.asset_type_name`,
    [userId]
  )).rows;
  const roiAbs = total_current - total_purchase;
  return {
    portfolio_summary: {
      total_current,
      total_purchase,
      roi: {
        absolute:   Math.round(roiAbs * 100)/100,
        percentage: total_purchase > 0 ? Math.round((roiAbs/total_purchase)*100) : 0
      }
    },
    distribution: dist.map(d => ({
      ...d,
      percentage: total_current>0 ? Math.round((d.total/total_current)*100) : 0
    }))
  };
}

export async function getGoldHistory(userId: number): Promise<GoldPoint[]> {
  const data = await getHistoricalGoldPrices();
  
  await Promise.all(data.map(p =>
    pool.query(
      `INSERT INTO gold_price_history(price_date,unit,currency,price)
       VALUES($1,$2,$3,$4)
       ON CONFLICT(price_date,unit,currency) DO UPDATE SET price=EXCLUDED.price`,
      [p.date, '24K', 'PKR', p.price]
    )
  ));
  return data;
}

export async function getStockHistory(
  userId: string,
  ticker: string,
  from:   string,
  to:     string,
  timespan?: string
): Promise<StockPoint[]> {
  return getHistoricalStockPrices(ticker, from, to, timespan);
}
