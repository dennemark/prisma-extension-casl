import { AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import { Prisma } from '@prisma/client'
import { applyCaslToQuery } from './applyCaslToQuery'
import { filterQueryResults } from './filterQueryResults'
import { getFluentModel } from './helpers'

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
export const useCaslAbilities = (getAbilities: () => PureAbility<AbilityTuple, PrismaQuery>) => {
    return Prisma.defineExtension({
        name: "prisma-extension-casl",
        query: {
            $allModels: {
                create({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                createMany({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                createManyAndReturn({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                upsert({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                findFirst({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                findFirstOrThrow({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                findMany({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                findUnique({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                findUniqueOrThrow({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                aggregate({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                count({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                groupBy({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                update({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                updateMany({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                delete({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
                },
                deleteMany({ args, query, model, operation, ...rest }) {
                    return query(applyCaslToQuery(operation, args, getAbilities(), model)).then((result) => filterQueryResults(result, getAbilities(), getFluentModel(model, rest)))
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





