import { Prisma } from '@prisma/client'
import { AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import { applyCaslToQuery } from './applyCaslToQuery'

export { applyCaslToQuery }

/**
 * enrich a prisma client to check for CASL abilities even in nested queries
 * 
 * `client.$extends(useCaslAbilities(build))` 
 * 
 * https://casl.js.org/v6/en/package/casl-prisma
 * 
 * 
 * @param getAbilities function to return CASL prisma abilities
 *  - this is a function call to instantiate abilities on each prisma query to allow adding i.e. context or claims
 * @returns enriched prisma client
 */
export const useCaslAbilities = (getAbilities: ()=> PureAbility<AbilityTuple, PrismaQuery>) =>{
    return Prisma.defineExtension({
        name: "prisma-extension-casl",
        query: {
            $allModels: {
                create ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                createMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                createManyAndReturn ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                upsert ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                findFirst ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                findFirstOrThrow ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                findMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                findUnique ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                findUniqueOrThrow ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                aggregate ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                count ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                groupBy ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                update ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                updateMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                delete ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                deleteMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, getAbilities(), model))
                },
                // async $allOperations<T>({ args, query, model, operation }: { args: any, query: any, model: any, operation: any }) {

                //     if (!(operation in caslOperationDict)) {
                //         return query(args)
                //     }

                //     args = applyCaslToQuery(operation, args, getAbilities(), model)

                //     return query(args)
                // },
            },
        }
    })
}





