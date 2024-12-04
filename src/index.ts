import { AbilityBuilder, AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import { Prisma, PrismaClient } from '@prisma/client'
import { applyCaslToQuery } from './applyCaslToQuery'
import { filterQueryResults } from './filterQueryResults'
import { caslOperationDict, getFluentField, getFluentModel, PrismaCaslOperation, PrismaExtensionCaslOptions, propertyFieldsByModel, relationFieldsByModel } from './helpers'

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

/**
 * enrich a prisma client to check for CASL abilities even in nested queries
 * 
 * `client.$extends(useCaslAbilities(build))` 
 * 
 * https://casl.js.org/v6/en/package/casl-prisma
 * 
 * 
 * @param getAbilityFactory function to return CASL prisma abilities
 *  - this is a function call to instantiate abilities on each prisma query to allow adding i.e. context or claims
 * @param opts additional options: { permissionField, additionalActions }
 * @returns enriched prisma client
 * @returns 
 */
export function useCaslAbilities(
    getAbilityFactory: () => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>,
    opts?: PrismaExtensionCaslOptions) {


    return Prisma.defineExtension((client) => {
        const allOperations = (getAbilities: () => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => ({
            async $allOperations<T>({ args, query, model, operation, ...rest }: { args: any, query: any, model: any, operation: any }) {

                const fluentModel = getFluentModel(model, rest)

                const [fluentRelationModel, fluentRelationField] = (fluentModel !== model ? Object.entries(relationFieldsByModel[model]).find(([k, v]) => v.type === fluentModel) : undefined) ?? [undefined, undefined]
                const transaction = (rest as any).__internalParams.transaction
                const debug = (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && args.debugCasl
                const debugAllErrors = args.debugCasl
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
                const abilities = transaction?.abilities ?? getAbilities().build()
                if (transaction) {
                    transaction.abilities = abilities
                }
                perf?.mark('prisma-casl-extension-1')


                /**
                 * for read actions we return null, if casl has an error
                 * except we use debugCasl
                 */
                function getCaslQuery() {
                    try {
                        return applyCaslToQuery(operation, args, abilities, model, opts?.permissionField ? true : false)
                    }
                    catch (e) {
                        if (debugAllErrors || caslOperationDict[operation as PrismaCaslOperation].action !== 'read') {
                            throw e
                        }

                    }
                }
                const caslQuery = getCaslQuery()

                if (!caslQuery) {
                    /** if casl query did not return a result we return either null or an empty array for findMany or list relation */
                    if (operation === 'findMany' || fluentRelationField?.isList) {
                        return []
                    } else {
                        return null
                    }
                }
                perf?.mark('prisma-casl-extension-2')
                logger?.log('Query Args', JSON.stringify(caslQuery.args))
                logger?.log('Query Mask', JSON.stringify(caslQuery.mask))

                const cleanupResults = (result: any) => {

                    perf?.mark('prisma-casl-extension-3')

                    if (fluentRelationModel && caslQuery.mask) {
                        // on fluent models we need to take mask of the relation
                        caslQuery.mask = fluentRelationModel && fluentRelationModel in caslQuery.mask ? caslQuery.mask[fluentRelationModel] : {}
                    }
                    const filteredResult = filterQueryResults(result, caslQuery.mask, caslQuery.creationTree, abilities, fluentModel as Prisma.ModelName, operation, opts)

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

                    return filteredResult

                }
                const operationAbility = caslOperationDict[operation as PrismaCaslOperation]
                /** 
                 * on update or create we need to create a transaction
                 * since there can be errors if newly created db entries
                 * are not permitted by abilities
                 * 
                 * for reads and deletes we skip the transaction
                 */
                if (transaction && transaction.kind === 'batch') {
                    //@ts-ignore
                    throw new Error('Sequential transactions are not supported in prisma-extension-casl.')
                    // const extendedRequest = request.then(cleanupResults)
                    // extendedRequest.requestTransaction = request.requestTransaction
                    //@ts-ignore
                    // return client._createPrismaPromise(new Promise((resolve, reject) => {
                    //     query(caslQuery.args).then(cleanupResults).then((result: any) => resolve(result)).catch(((e: any) => reject(e)))
                    // })
                }
                const transactionQuery = async (txClient: any) => {

                    if (opts?.beforeQuery) {
                        await opts.beforeQuery(txClient)
                    }
                    if (operationAbility.action === 'update' || operationAbility.action === 'create' || operation === 'deleteMany') {
                        /**
                         *  we get all update/deleteMany entries for logging purposes.
                         */
                        const getMany = operation === 'deleteMany' || operation === 'updateMany'
                        const manyResult = getMany ? await txClient[model].findMany(caslQuery.args.where ? { where: caslQuery.args.where } : undefined).then((res: any[]) => {
                            /** create update objects for updateMany */
                            return operation === 'updateMany' ? res.map((r) => ({ ...caslQuery.args.data, id: r.id })) : res
                        }) : []
                        /**
                         *  we use createManyAndReturn instead of createMany createMany entries for logging purposes and to check permissions on new entries
                         */
                        const op = operation === 'createMany' ? 'createManyAndReturn' : operation
                        return txClient[model][op](caslQuery.args).then(async (result: any) => {
                            // we need to get the updated many result
                            if (opts?.afterQuery) {
                                await opts.afterQuery(txClient)
                            }
                            const filteredResult = cleanupResults(getMany ? manyResult : result)
                            const results = operation === 'createMany'
                                ? { count: result.length }
                                : getMany ? { count: manyResult.length }
                                    : filteredResult
                            return results
                        })
                    } else {

                        return txClient[model][operation](caslQuery.args).then(async (result: any) => {
                            // we need to get the updated many result
                            if (opts?.afterQuery) {
                                await opts.afterQuery(txClient)
                            }
                            const fluentField = getFluentField(rest)

                            if (fluentField) {
                                return cleanupResults(result?.[fluentField])
                            }
                            return cleanupResults(result)
                        })
                    }
                }
                if (transaction && transaction.kind === 'itx') {

                    return transactionQuery((client as any)._createItxClient(transaction))
                } else {
                    return client.$transaction(async (tx) => {

                        (tx as any)[
                            Symbol.for("prisma.client.transaction.id")
                        ] = 'casl-extension-' + (tx as any)[
                        Symbol.for("prisma.client.transaction.id")
                        ]
                        //@ts-ignore
                        return transactionQuery(tx)
                    }, {
                        //https://github.com/prisma/prisma/issues/20015
                        maxWait: 10000 // default prisma pool timeout. would be better to get it from client
                    })
                }

            }
        })


            // Derived from yates:
            // By default, Prisma will batch requests by the transaction ID if it is present.
            // If our transaction id does not include casl-extension- it is a normal interactive transaction
            // and we hook into it. otherwise we use normal batching for our transaction
            // - https://github.com/prisma/prisma/blob/5.21.1/packages/client/src/runtime/RequestHandler.ts#L122
            // - https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance
            ; (client as any)._requestHandler.dataloader.options.batchBy = (
                request: any,
            ) => {

                if (request.transaction?.id && !request.transaction?.id?.toString().startsWith('casl-extension-')) {
                    return `transaction-${request.transaction.id}`;
                }

                return getBatchId(request.protocolQuery);
            };


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
                    // alter the getAblities function shortly
                    return client.$extends({
                        query: {
                            $allModels: {
                                ...allOperations(() => extendFactory(getAbilityFactory()))
                            }
                        }
                    })
                }
            },
            query: {
                $allModels: {
                    ...allOperations(getAbilityFactory)
                },
            }
        })
    })
}


//https://github.com/prisma/prisma/blob/1a9ef0fbd3948ee708add6816a33743e1ff7df9c/packages/client/src/runtime/core/jsonProtocol/getBatchId.ts#L4

export function getBatchId(query: any): string | undefined {
    if (query.action !== "findUnique" && query.action !== "findUniqueOrThrow") {
        return undefined;
    }
    const parts: string[] = [];
    if (query.modelName) {
        parts.push(query.modelName);
    }

    if (query.query.arguments) {
        parts.push(buildKeysString(query.query.arguments));
    }
    parts.push(buildKeysString(query.query.selection));

    return parts.join("");
}


function buildKeysString(obj: object): string {
    const keysArray = Object.keys(obj)
        .sort()
        .map((key) => {
            // @ts-ignore
            const value = obj[key];
            if (typeof value === "object" && value !== null) {
                return `(${key} ${buildKeysString(value)})`;
            }
            return key;
        });

    return `(${keysArray.join(" ")})`;
}

