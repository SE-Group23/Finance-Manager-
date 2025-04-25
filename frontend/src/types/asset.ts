export enum AssetType {
  GOLD     = 'gold',
  STOCK    = 'stock',
  CURRENCY = 'currency',
}

export enum GoldUnit {
  GRAM  = 'gram',
  TOLA  = 'tola',
  OUNCE = 'ounce',
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  PKR = "PKR",
}

export interface Asset {
  asset_id: number
  user_id: number
  asset_type: string
  quantity: number
  purchase_value: number
  current_value: number
  acquired_on: string
  created_at: string
  updated_at: string
  asset_details: {
    unit?: GoldUnit
    ticker?: string
    name?: string
    currency?: Currency
  }
}

export interface PortfolioSummary {
  portfolio_summary: {
    total_current: number
    total_purchase: number
    roi: {
      absolute: number
      percentage: number
    }
  }
  distribution: {
    asset_type: string
    count: number
    total: number
    percentage: number
  }[]
}
