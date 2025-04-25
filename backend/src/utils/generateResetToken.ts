// backend/src/utils/generateResetToken.ts
import jwt from 'jsonwebtoken';

export function generateResetToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_RESET_SECRET!, {
    expiresIn: '15m', // valid for 15 minutes
  });
}
