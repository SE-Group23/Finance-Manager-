export interface User {
    user_id?: number;
    user_name: string;
    email: string;
    password_hash: string;
    created_on?: Date;
    last_login?: Date | null;
  }
  