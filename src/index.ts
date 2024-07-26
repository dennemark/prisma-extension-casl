import { Prisma } from '@prisma/client'
import { AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import { applyCaslToQuery } from './applyCaslToQuery'


/**
 * enrich a prisma client to check for CASL abilities even in nested queries
 * 
 * `client.$extends(useCaslAbilities(build))` 
 * 
 * https://casl.js.org/v6/en/package/casl-prisma
 * 
 * 
 * @param getAbilities function to return CASL prisma abilities - this is a function call to instantiate abilities on client call with i.e. context and claims
 * @returns enriched prisma client
 */
export const useCaslAbilities = (getAbilities: ()=> PureAbility<AbilityTuple, PrismaQuery>) =>{
    const abilities = getAbilities()
    return Prisma.defineExtension({
        name: "prisma-extension-casl",
        query: {
            $allModels: {
                create ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                createMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                createManyAndReturn ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                upsert ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findFirst ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findFirstOrThrow ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findUnique ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findUniqueOrThrow ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                aggregate ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                count ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                groupBy ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                update ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                updateMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                delete ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                deleteMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                // async $allOperations<T>({ args, query, model, operation }: { args: any, query: any, model: any, operation: any }) {

                //     if (!(operation in caslOperationDict)) {
                //         return query(args)
                //     }

                //     args = applyCaslToQuery(operation, args, abilities, model)

                //     return query(args)
                // },
            },
        }
    })
}





