import express, { Request, Response } from 'express';
import 'dotenv/config';
import { disconnectDb } from './lib/prisma';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on("uncaughtException", async (error) => {
    console.error("Uncaught Exception:", error);
    await disconnectDb().finally(() => process.exit(1));
});

process.on("unhandledRejection", async (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    await disconnectDb().finally(() => process.exit(1));
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await disconnectDb();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});