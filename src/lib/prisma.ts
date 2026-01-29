import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
    pgPool?: Pool
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
    throw new Error(
        'DATABASE_URL is not set. Create a .env file (or export DATABASE_URL) with a valid PostgreSQL connection string.'
    )
}

const pgPool =
    globalForPrisma.pgPool ??
    new Pool({
        connectionString: databaseUrl,
    })

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter: new PrismaPg(pgPool),
        log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
    globalForPrisma.pgPool = pgPool
}

export const connectDb = async () => {
    try {
        await prisma.$connect()
        console.log('Database connected')
    } catch (error) {
        console.error('Database connection error:', error)
        process.exit(1)
    }
}

export const disconnectDb = async () => {
    try {
        await prisma.$disconnect()
        await globalForPrisma.pgPool?.end()
        console.log('Database disconnected')
    } catch (error) {
        console.error('Error during database disconnection:', error)
    }
}
