import type { Prisma } from '@prisma/client'

/**
 * applies accessibleBy query to query
 * 
 * convenience function 
 * 
 * @param query current query (where or connect/disconnect)
 * @param accessibleQuery casl accessibleBy query result
 * @returns enriched query
 */
export function applyAccessibleQuery<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, query: any, accessibleQuery: any) {

    if (accessibleQuery && Object.keys(accessibleQuery).length > 0) {
        return {
            ...query,
            AND: [
                ...(query.AND ?? []),
                accessibleQuery
            ]

        }
    } else {
        return query
    }
}