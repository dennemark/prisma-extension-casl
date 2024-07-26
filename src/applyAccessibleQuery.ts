
/**
 * applies accessibleBy query to query
 * 
 * convenience function 
 * 
 * @param query current query (where or connect/disconnect)
 * @param accessibleQuery casl accessibleBy query result
 * @returns enriched query
 */
export function applyAccessibleQuery(query: any, accessibleQuery: any){
    return {
         ...query,
         AND: [
             ...(query.AND ?? []),
             accessibleQuery
         ]
 
     }
 }