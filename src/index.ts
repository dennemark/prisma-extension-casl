import { AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import { Prisma } from '@prisma/client'
import { applyCaslToQuery } from './applyCaslToQuery'
import { filterQueryResults } from './filterQueryResults'
import { caslOperationDict, getFluentModel } from './helpers'

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
                async $allOperations<T>({ args, query, model, operation, ...rest }: { args: any, query: any, model: any, operation: any }) {
                    // performance.clearMeasures()
                    // performance.clearMarks()
                    if (!(operation in caslOperationDict)) {
                        return query(args)
                    }
                    // performance.mark('start')
                    const abilities = getAbilities()
                    // performance.mark('abilities')
                    const caslQuery = applyCaslToQuery(operation, args, abilities, model)

                    // performance.mark('finishCaslQuery')
                    return query(caslQuery.args).then((result: any) => {
                        // performance.mark('finishQuery')

                        const res = filterQueryResults(result, caslQuery.mask, abilities, getFluentModel(model, rest))
                        // performance.mark('finishFiltering')
                        // console.log(
                        //     [performance.measure('overall', 'start', 'finishFiltering'),
                        //     performance.measure('create abilities', 'start', 'abilities'),
                        //     performance.measure('create casl query', 'abilities', 'finishCaslQuery'),
                        //     performance.measure('finish query', 'finishCaslQuery', 'finishQuery'),
                        //     performance.measure('filtering results', 'finishQuery', 'finishFiltering')
                        //     ].map((measure) => {
                        //         return `${measure.name}: ${measure.duration}`
                        //     })
                        // )
                        return res
                    })
                },
            },
        }
    })
}





