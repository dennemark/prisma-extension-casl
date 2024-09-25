import { AbilityBuilder, AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import { Prisma } from '@prisma/client'
import { applyCaslToQuery } from './applyCaslToQuery'
import { filterQueryResults } from './filterQueryResults'
import { caslOperationDict, getFluentModel, PrismaCaslOperation, propertyFieldsByModel, relationFieldsByModel } from './helpers'

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
export function useCaslAbilities(getAbilityFactory: () => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>, permissionField?: string) {


    return Prisma.defineExtension((client) => {
        let getAbilities = () => getAbilityFactory()
        return client.$extends({
            name: "prisma-extension-casl",
            client: {
                // https://github.com/prisma/prisma/issues/20678
                // $transaction(...props: Parameters<(typeof client)['$transaction']>): ReturnType<(typeof client)['$transaction']> {
                //     return transactionStore.run({ alreadyInTransaction: true }, () => {
                //         return client.$transaction(...props);
                //     });
                // },
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
                        const op = operation === 'createMany' ? 'createManyAndReturn' : operation
                        const transaction = (rest as any).__internalParams.transaction
                        const debug = (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && args.debugCasl
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

                        if (!(op in caslOperationDict)) {
                            return query(args)
                        }


                        perf?.mark('prisma-casl-extension-0')
                        const abilities = transaction?.abilities ?? getAbilities().build()
                        if (transaction) {
                            transaction.abilities = abilities
                        }
                        // reset alteration of getAblities function
                        getAbilities = () => getAbilityFactory()
                        perf?.mark('prisma-casl-extension-1')


                        const caslQuery = applyCaslToQuery(operation, args, abilities, model, permissionField ? true : false)


                        perf?.mark('prisma-casl-extension-2')
                        logger?.log('Query Args', JSON.stringify(caslQuery.args))
                        logger?.log('Query Mask', JSON.stringify(caslQuery.mask))

                        const cleanupResults = (result: any) => {

                            perf?.mark('prisma-casl-extension-3')
                            const fluentModel = getFluentModel(model, rest)

                            if (fluentModel !== model && caslQuery.mask) {
                                // on fluent models we need to take mask of the relation
                                const relation = Object.entries(relationFieldsByModel[model]).find(([k, v]) => v.type === fluentModel)?.[0]
                                caslQuery.mask = relation && relation in caslQuery.mask ? caslQuery.mask[relation] : {}
                            }
                            const filteredResult = filterQueryResults(result, caslQuery.mask, caslQuery.creationTree, abilities, fluentModel, permissionField)

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

                            return operation === 'createMany' ? { count: filteredResult.length } : filteredResult
                        }
                        const operationAbility = caslOperationDict[operation as PrismaCaslOperation]
                        /** 
                         * on update or create we need to create a transaction
                         * since there can be errors if newly created db entries
                         * are not permitted by abilities
                         * 
                         * for reads and deletes we skip the transaction
                         */
                        if (operationAbility.action === 'update' || operationAbility.action === 'create') {
                            if (transaction) {
                                if (transaction.kind === 'itx') {
                                    const transactionClient = (client as any)._createItxClient(transaction)
                                    return transactionClient[model][op](caslQuery.args).then(cleanupResults)
                                } else if (transaction.kind === 'batch') {
                                    //@ts-ignore
                                    throw new Error('Sequential transactions are not supported in prisma-extension-casl.')
                                    // const extendedRequest = request.then(cleanupResults)
                                    // extendedRequest.requestTransaction = request.requestTransaction
                                    //@ts-ignore
                                    // return client._createPrismaPromise(new Promise((resolve, reject) => {
                                    //     query(caslQuery.args).then(cleanupResults).then((result: any) => resolve(result)).catch(((e: any) => reject(e)))
                                    // })
                                }
                            } else {

                                return client.$transaction(async (tx) => {
                                    //@ts-ignore
                                    return tx[model][op](caslQuery.args).then(cleanupResults)
                                })
                            }
                        } else {
                            return query(caslQuery.args).then(cleanupResults)
                        }
                    },
                },
            }
        })
    })
}


