import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';


export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }

        const user = await registerUser(email, password);

        res.status(201).json({
            message: "User created successfully.",
            user: { id: user.id, email: user.email },
        });

    } catch (error: any) {
        if (error.message === 'EMAIL_IN_USE') {
            res.status(400).json({ message: "This email is already in use." });
            return;
        }

        console.error("Register error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }

        const { token, user } = await loginUser(email, password);

        res.status(200).json({
            message: "Login successful.",
            token,
            user,
        });

    } catch (error: any) {
        if (error.message === 'INVALID_CREDENTIALS') {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }

        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
