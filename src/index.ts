import { AbilityBuilder, AbilityTuple, PureAbility } from '@casl/ability'
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
export function useCaslAbilities(getAbilityFactory: () => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) {


    return Prisma.defineExtension((client) => {
        let getAbilities = () => getAbilityFactory()
        return client.$extends({
            name: "prisma-extension-casl",
            client: {
                $casl(extendFactory: (factory: AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) {
                    const ctx = Prisma.getExtensionContext(this)
                    // alter the getAblities function shortly
                    getAbilities = () => extendFactory(getAbilityFactory())
                    return ctx as typeof client
                }
            },
            query: {
                $allModels: {
                    async $allOperations<T>({ args, query, model, operation, ...rest }: { args: any, query: any, model: any, operation: any }) {
                        const debug = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' && args.debugCasl
                        delete args.debugCasl
                        const perf = debug ? performance : undefined
                        const logger = debug ? console : undefined
                        perf?.clearMeasures('prisma-casl-extension-Overall')
                        perf?.clearMeasures('prisma-casl-extension-Create Abilities')
                        perf?.clearMeasures('prisma-casl-extension-Create Casl Query')
                        perf?.clearMeasures('prisma-casl-extension-Finish Query')
                        perf?.clearMeasures('prisma-casl-extension-Filtering Results')
                        perf?.clearMarks('prisma-casl-extension-0')
                        perf?.clearMarks('prisma-casl-extension-1')
                        perf?.clearMarks('prisma-casl-extension-2')
                        perf?.clearMarks('prisma-casl-extension-3')
                        perf?.clearMarks('prisma-casl-extension-4')


                        if (!(operation in caslOperationDict)) {
                            return query(args)
                        }


                        perf?.mark('prisma-casl-extension-0')

                        const abilities = getAbilities().build()
                        // reset alteration of getAblities function
                        getAbilities = () => getAbilityFactory()
                        perf?.mark('prisma-casl-extension-1')


                        const caslQuery = applyCaslToQuery(operation, args, abilities, model)


                        perf?.mark('prisma-casl-extension-2')
                        logger?.log('Query Args', JSON.stringify(caslQuery.args))
                        logger?.log('Query Mask', JSON.stringify(caslQuery.mask))

                        return query(caslQuery.args).then((result: any) => {

                            perf?.mark('prisma-casl-extension-3')


                            const res = filterQueryResults(result, caslQuery.mask, abilities, getFluentModel(model, rest))

                            if (perf) {
                                perf.mark('prisma-casl-extension-4')
                                logger?.log(
                                    [perf.measure('prisma-casl-extension-Overall', 'prisma-casl-extension-0', 'prisma-casl-extension-4'),
                                    perf.measure('prisma-casl-extension-Create Abilities', 'prisma-casl-extension-0', 'prisma-casl-extension-1'),
                                    perf.measure('prisma-casl-extension-Create Casl Query', 'prisma-casl-extension-1', 'prisma-casl-extension-2'),
                                    perf.measure('prisma-casl-extension-Finish Query', 'prisma-casl-extension-2', 'prisma-casl-extension-3'),
                                    perf.measure('prisma-casl-extension-Filtering Results', 'prisma-casl-extension-3', 'prisma-casl-extension-4')
                                    ].map((measure) => {
                                        return `${measure.name.replace('prisma-casl-extension-', '')}: ${measure.duration}`
                                    })
                                )
                            }
                            return res
                        })
                    },
                },
            }
        })
    })
}





