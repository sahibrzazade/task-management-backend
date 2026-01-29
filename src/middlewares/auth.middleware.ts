import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

interface JwtPayload {
    userId: string;
    email: string;
}

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Unauthorized: Token not found.' });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({ message: 'Invalid or expired token.' });
            return;
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};