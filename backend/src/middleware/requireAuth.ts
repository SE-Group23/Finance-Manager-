// backend/src/middleware/requireAuth.ts
import { RequestHandler } from 'express';
import { verifyToken } from '../auth';

export const requireAuth: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'No token provided' });
        return; // explicitly return so TS knows the function ends here
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        (req as any).userId = (payload as any).id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};
