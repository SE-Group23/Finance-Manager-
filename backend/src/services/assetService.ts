import { pool } from '../db';
import { AssetType, GoldUnit, Currency } from '../constants/assets';
import * as goldSvc from './goldService';
import * as stockSvc from './stockService';
import * as fxSvc   from './currencyService';

export interface CreateAssetDTO {
  assetType:     AssetType;
  quantity:      number;
  purchaseValue: number;
  acquiredOn?:   string;
  assetDetails: {
    unit?: GoldUnit;
    currency?: Currency;
   
    ticker?: string;
    
    currencyCode?: string;
  };
}

export interface UpdateAssetDTO extends CreateAssetDTO {
  assetId: number;
}

export async function getAssetTypeId(name: AssetType): Promise<number> {
  try{
  const sel = await pool.query(
    `SELECT asset_type_id FROM asset_types WHERE asset_type_name=$1`, [name]
  );
  if (sel.rowCount) return sel.rows[0].asset_type_id;
  }  catch (e) {
  }

  const ins = await pool.query(
    `INSERT INTO asset_types(asset_type_name) VALUES($1) RETURNING asset_type_id`,
    [name]
  );
  return ins.rows[0].asset_type_id;
}

async function getOrCreateMetadata(dto: CreateAssetDTO): Promise<number> {
  const typeId = await getAssetTypeId(dto.assetType);

  try{
    if (dto.assetType === AssetType.GOLD) {
      const unit = "tola";
      const cur  = "PKR";
      const sel = await pool.query(
        `SELECT metadata_id FROM asset_metadata
        WHERE asset_type_id=$1 AND unit=$2 AND currency_code=$3`,
        [typeId, unit, cur]
      );
      if (sel.rowCount) return sel.rows[0].metadata_id;
      const ins = await pool.query(
        `INSERT INTO asset_metadata(asset_type_id, unit, currency_code)
        VALUES($1,$2,$3) RETURNING metadata_id`,
        [typeId, unit, cur]
      );
      return ins.rows[0].metadata_id;
    }

  } catch (e) {

  }

  if (dto.assetType === AssetType.STOCK) {
    const ticker = dto.assetDetails.ticker!;
    const meta = await stockSvc.getTickerMeta(ticker);
    if (!meta) throw new Error(`Ticker ${ticker} not found`);

    const sel = await pool.query(
      `SELECT metadata_id FROM asset_metadata
       WHERE asset_type_id=$1 AND ticker=$2`,
      [typeId, ticker]
    );
    if (sel.rowCount) return sel.rows[0].metadata_id;

    const ins = await pool.query(
      `INSERT INTO asset_metadata(asset_type_id, ticker, company_name, currency_code)
       VALUES($1,$2,$3,$4) RETURNING metadata_id`,
      [typeId, meta.ticker, meta.name, "USD"]
    );
    return ins.rows[0].metadata_id;
  }

  if (dto.assetType === AssetType.CURRENCY) {
    const code = dto.assetDetails.currencyCode!;
    await fxSvc.syncSupportedCurrencies();
    const sel = await pool.query(
      `SELECT metadata_id FROM asset_metadata
       WHERE asset_type_id=$1 AND currency_code=$2`,
      [typeId, code]
    );
    if (sel.rowCount) return sel.rows[0].metadata_id;
    const ins = await pool.query(
      `INSERT INTO asset_metadata(asset_type_id, currency_code)
       VALUES($1,$2) RETURNING metadata_id`,
      [typeId, code]
    );
    return ins.rows[0].metadata_id;
  }

  throw new Error(`Unknown assetType ${dto.assetType}`);
}

export async function createAsset(userId: number, dto: CreateAssetDTO) {

   let metadataId;
   try {
     metadataId = await getOrCreateMetadata(dto);
   } catch (e) {
     throw e;
   }
 
  let current = dto.purchaseValue;
  try{
    if (dto.assetType === AssetType.GOLD) {
      const live = await goldSvc.getLatestGoldPrice("tola", "PKR");
      await goldSvc.ensureRecentGoldHistory("tola", "PKR");
      current = live * dto.quantity;
    }
    else if (dto.assetType === AssetType.STOCK) {
      current = await stockSvc.getStockCurrentValue(dto.assetDetails.ticker!, dto.quantity, dto.acquiredOn!);
    }
    else if (dto.assetType === AssetType.CURRENCY) {
      const code = dto.assetDetails.currencyCode!;
      const date = dto.acquiredOn ? new Date(dto.acquiredOn).toISOString().split("T")[0] : undefined;

      let converted = await fxSvc.getLatestRateToPKR(code, date);

      current = converted * dto.quantity;
    }
  } catch (e) {
    throw e;
  }

  let asset;
  try{
    const { rows } = await pool.query(
      `INSERT INTO assets(user_id,metadata_id,quantity,purchase_value,current_value,acquired_on,value_currency)
      VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        userId,
        metadataId,
        dto.quantity,
        dto.purchaseValue,
        current,
        dto.acquiredOn ? new Date(dto.acquiredOn) : new Date(),
        dto.assetType === AssetType.GOLD
          ? "PKR"
          : dto.assetType === AssetType.STOCK
            ? (await stockSvc.getTickerMeta(dto.assetDetails.ticker!))!.currency
            : dto.assetDetails.currencyCode
      ]
    );
    asset = rows[0];
  } catch (e) {
    throw e;
  }

  try{
    await pool.query(
      `INSERT INTO asset_history(asset_id,value_date,recorded_value)
      VALUES($1,CURRENT_DATE,$2)
      ON CONFLICT(asset_id,value_date) DO UPDATE SET recorded_value=EXCLUDED.recorded_value`,
      [asset.asset_id, current]
    );
    
  } catch (e) {
  }

  return asset;
  
}

export async function updateAsset(userId: number, dto: UpdateAssetDTO) {
  const metadataId = await getOrCreateMetadata(dto);
  let current = dto.purchaseValue;
  if (dto.assetType === AssetType.GOLD) {
    await goldSvc.ensureRecentGoldHistory("tola", "PKR");
    const live = await goldSvc.getLatestGoldPrice("tola", "PKR");
    current = live * dto.quantity;
  }
  else if (dto.assetType === AssetType.STOCK) {
    current = await stockSvc.getStockCurrentValue(dto.assetDetails.ticker!, dto.quantity, dto.acquiredOn!);
  }
  else if (dto.assetType === AssetType.CURRENCY) {
    const rates = await fxSvc.convertCurrency(dto.quantity, dto.assetDetails.currencyCode!, ['USD']);
    current = rates.find(r => r.code==='USD')!.value;
  }

  const { rowCount, rows } = await pool.query(
    `UPDATE assets SET
       metadata_id=$1,quantity=$2,purchase_value=$3,
       current_value=$4,acquired_on=$5,value_currency=$6,updated_at=NOW()
     WHERE asset_id=$7 AND user_id=$8
     RETURNING *`,
    [
      metadataId,
      dto.quantity,
      dto.purchaseValue,
      current,
      dto.acquiredOn ? new Date(dto.acquiredOn) : new Date(),
      dto.assetType===AssetType.GOLD
        ? "PKR"
        : dto.assetType===AssetType.STOCK
          ? (await stockSvc.getTickerMeta(dto.assetDetails.ticker!))!.currency
          : dto.assetDetails.currencyCode,
      dto.assetId,
      userId
    ]
  );
  if (!rowCount) throw Object.assign(new Error('Not found'), { status:404 });

  await pool.query(
    `INSERT INTO asset_history(asset_id,value_date,recorded_value)
     VALUES($1,CURRENT_DATE,$2)
     ON CONFLICT(asset_id,value_date) DO UPDATE SET recorded_value=EXCLUDED.recorded_value`,
    [dto.assetId, current]
  );

  return rows[0];
}

export async function deleteAsset(userId: number, assetId: number) {
  const { rowCount } = await pool.query(
    `DELETE FROM assets WHERE asset_id=$1 AND user_id=$2`,
    [assetId,userId]
  );
  if (!rowCount) throw Object.assign(new Error('Not found'), { status:404 });
}

export async function fetchUserAssets(userId: number) {
  const { rows } = await pool.query(`
    SELECT a.*, t.asset_type_name AS asset_type, m.*
      FROM assets a
      JOIN asset_metadata m ON a.metadata_id = m.metadata_id
      JOIN asset_types t ON m.asset_type_id = t.asset_type_id
     WHERE a.user_id = $1
     ORDER BY a.acquired_on DESC
  `, [userId]);

  return rows;
}



export async function refreshAssetValues(userId: number) {
  const assets = await fetchUserAssets(userId);
  await Promise.all(assets.map(async a => {
    let newVal = a.purchase_value;
    if (a.asset_type===AssetType.GOLD) {
      newVal = (await goldSvc.getLatestGoldPrice("tola", "PKR")) * a.quantity;
    } else if (a.asset_type===AssetType.STOCK) {
      newVal = await stockSvc.getStockCurrentValue(a.ticker, a.quantity, a.acquiredOn);
    } else {
      const rates = await fxSvc.convertCurrency(a.quantity, a.currency_code, ['USD']);
      newVal = rates.find(r=>r.code==='USD')!.value;
    }
    await pool.query(
      `UPDATE assets SET current_value=$1, updated_at=NOW() WHERE asset_id=$2`,
      [newVal, a.asset_id]
    );
    await pool.query(
      `INSERT INTO asset_history(asset_id,value_date,recorded_value)
       VALUES($1,CURRENT_DATE,$2)
       ON CONFLICT(asset_id,value_date) DO UPDATE SET recorded_value=EXCLUDED.recorded_value`,
      [a.asset_id, newVal]
    );
  }));
  return fetchUserAssets(userId);
}

export async function getPortfolioSummary(userId: number) {
  const [{ total_current, total_purchase }] = (await pool.query(`
    SELECT SUM(current_value)::float AS total_current,
           SUM(purchase_value)::float AS total_purchase
      FROM assets
     WHERE user_id=$1
  `,[userId])).rows;
  const dist = (await pool.query(`
    SELECT t.asset_type_name AS asset_type,
           COUNT(*) AS count,
           SUM(a.current_value)::float AS total
      FROM assets a
      JOIN asset_metadata m on a.metadata_id=m.metadata_id
      JOIN asset_types t on m.asset_type_id=t.asset_type_id
     WHERE a.user_id=$1
     GROUP BY t.asset_type_name
  `,[userId])).rows;
  const roiAbs = total_current - total_purchase;
  return {
    portfolio_summary: {
      total_current, total_purchase,
      roi: {
        absolute: Math.round(roiAbs*100)/100,
        percentage: total_purchase>0
          ? Math.round((roiAbs/total_purchase)*100)
          : 0
      }
    },
    distribution: dist.map(d=>({
      ...d,
      percentage: total_current>0
        ? Math.round((d.total/total_current)*100)
        : 0
    }))
  };
}

export async function getGoldHistory(unit: "tola", currency: "PKR") {
  await goldSvc.ensureRecentGoldHistory(unit,currency);
  return goldSvc.getHistoricalGoldPrices(unit,currency);
}
