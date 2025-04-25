import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function generateToken(userId: number): string {
    const secret = process.env.JWT_SECRET!;
    return jwt.sign({ id: userId }, secret, { expiresIn: '1d' });
}

export function verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET!;
    return jwt.verify(token, secret);
}