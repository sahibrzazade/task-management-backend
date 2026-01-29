import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;
const HASH_ROUNDS = 10;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export const registerUser = async (email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('EMAIL_IN_USE');
    }

    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });

    return { id: user.id, email: user.email };
};

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    return {
        token,
        user: { id: user.id, email: user.email },
    };
};

export const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    return {
        id: user.id,
        email: user.email,
    };
};