export interface Transaction {
    transaction_id?: number;
    user_id: number;
    amount: number;
    category_id?: number | null;
    transaction_date: Date;
    description?: string | null;
  }