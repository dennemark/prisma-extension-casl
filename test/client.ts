import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
export const seedClient = new PrismaClient({ adapter })
