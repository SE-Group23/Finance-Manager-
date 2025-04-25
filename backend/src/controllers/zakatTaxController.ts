import { Request, Response } from 'express';
import { pool } from '../db';

async function getUserAssets(userId: number): Promise<any[]> {
  try {
    const result = await pool.query(`
      SELECT 
        a.asset_id,
        at.asset_type_name,
        a.quantity,
        a.current_value,
        a.value_currency,
        am.unit,
        am.currency_code,
        am.ticker
      FROM 
        assets a
      JOIN 
        asset_metadata am ON a.metadata_id = am.metadata_id
      JOIN 
        asset_types at ON am.asset_type_id = at.asset_type_id
      WHERE 
        a.user_id = $1
    `, [userId]);

    return result.rows;
  } catch (error) {
    throw error;
  }
}

function calculateAssetTotalsByType(assets: any[]): Record<string, number> {
  const totals: Record<string, number> = {
    gold: 0,
    cash: 0,
    stocks: 0,
    currency: 0,
    total: 0,
  };

  for (const asset of assets) {
    const value = parseFloat(asset.current_value);

    switch (asset.asset_type_name.toLowerCase()) {
      case 'gold':
        totals.gold += value;
        break;
      case 'cash':
        totals.cash += value;
        break;
      case 'stock':
        totals.stocks += value;
        break;
      case 'currency':
        totals.currency += value;
        break;
    }

    totals.total += value;
  }

  return totals;
}

function calculateTax(income: number): { amount: number; rate: number; bracket: string } {
  let amount = 0;
  let rate = 0;
  let bracket = '';

  if (income <= 600000) {
    amount = 0;
    rate = 0;
    bracket = 'PKR 0 – 600,000';
  } else if (income <= 1200000) {
    amount = (income - 600000) * 0.025;
    rate = 2.5;
    bracket = 'PKR 600,001 – 1,200,000';
  } else if (income <= 2400000) {
    amount = 15000 + (income - 1200000) * 0.15;
    rate = 15;
    bracket = 'PKR 1,200,001 – 2,400,000';
  } else if (income <= 3600000) {
    amount = 195000 + (income - 2400000) * 0.20;
    rate = 20;
    bracket = 'PKR 2,400,001 – 3,600,000';
  } else if (income <= 6000000) {
    amount = 435000 + (income - 3600000) * 0.25;
    rate = 25;
    bracket = 'PKR 3,600,001 – 6,000,000';
  } else {
    amount = 1035000 + (income - 6000000) * 0.35;
    rate = 35;
    bracket = 'PKR 6,000,001 and above';
  }

  return { amount, rate, bracket };
}

async function getNisaabThreshold(): Promise<number> {
  try {
    const { rows } = await pool.query(`
      SELECT price 
      FROM gold_price_history
      WHERE unit = 'tola' AND currency = 'PKR'
      ORDER BY price_date DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      throw new Error('Gold price not available');
    }

    const goldPricePerTola = parseFloat(rows[0].price);
    const nisabInTolas = 7.5;

    return goldPricePerTola * nisabInTolas;
  } catch (error) {
    throw error;
  }
}

async function getAnnualIncome(userId: number): Promise<number> {
  try {
    const startOfFiscalYear = new Date('2024-07-01');
    const endOfFiscalYear = new Date('2025-07-01');

    const { rows } = await pool.query(`
      SELECT SUM(amount) AS total_income
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE LOWER(c.category_name) = 'income'
        AND t.transaction_type = 'credit'
        AND t.user_id = $1
        AND t.transaction_date >= $2
        AND t.transaction_date < $3
    `, [userId, startOfFiscalYear, endOfFiscalYear]);

    const income = parseFloat(rows[0]?.total_income ?? "0");
    return isNaN(income) ? 0 : income;
  } catch (error) {
    throw error;
  }
}

export async function getZakatAndTaxSummary(req: Request, res: Response): Promise<void> {

  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const assets = await getUserAssets(userId);
    const assetTotals = calculateAssetTotalsByType(assets);
    const annualIncome = await getAnnualIncome(userId);
    const nisaabThreshold = await getNisaabThreshold();
    const zakatRate = 0.025;

    const exceedsNisaab = assetTotals.total >= nisaabThreshold;
    const zakatAmount = exceedsNisaab ? assetTotals.total * zakatRate : 0;
    const tax = calculateTax(annualIncome);

    const now = new Date();
    const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const taxDueDate = new Date(startYear + 1, 6, 31);
    const msInDay = 1000 * 60 * 60 * 24;
    const daysRemaining = Math.max(Math.ceil((taxDueDate.getTime() - now.getTime()) / msInDay), 0);

    res.json({
      success: true,
      data: {
        zakat: {
          nisaab_status: {
            status: exceedsNisaab ? "Nisaab Threshold exceeded" : "Below Nisaab Threshold",
            based_on: assets.length > 0 ? "Current assets" : "No assets available"
          },
          current_assets: assetTotals.total,
          cash_savings: assetTotals.cash,
          total_assets: assetTotals.total,
          asset_breakdown: {
            gold: assetTotals.gold,
            currency: assetTotals.currency,
            stocks: assetTotals.stocks
          },
          nisaab_threshold: nisaabThreshold,
          zakat_rate: zakatRate * 100,
          zakat_payable: zakatAmount
        },

        tax: {
          threshold_status: {
            status: annualIncome > 0 ? "Tax Threshold Met" : "No Income Data",
            based_on: annualIncome > 0 ? "Annual Income" : "No income available"
          },
          annual_income: annualIncome,
          tax_bracket: tax.bracket,
          tax_rate: tax.rate,
          tax_payable: tax.amount,
          due_date: {
            date: taxDueDate.toISOString().split('T')[0],
            days_remaining: daysRemaining
          }
        },

        preferred_currency: "PKR"
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Error retrieving Zakat and Tax summary' });
  }
}
