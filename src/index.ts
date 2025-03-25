import { AbilityBuilder, AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import { Prisma, PrismaClient, PrismaPromise } from '@prisma/client'
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
    // Set default options
    const txMaxWait = opts?.txMaxWait ?? 30000
    const txTimeout = opts?.txTimeout ?? 30000

    return Prisma.defineExtension((client) => {
        let tickActive = false;
        const batches: Record<string, Array<{
            params: object;
            model: string;
            action: string;
            args: unknown;
            /** called before resolve */
            callback: (result: unknown) => void;
            resolve: (result: unknown) => void;
            reject: (error: unknown) => void;
        }>> = {};

        function extendCaslAbilities(extendFactory: (factory: AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) {

            // alter the getAblities function shortly
            const extendedClient = client.$extends({
                query: {
                    $allModels: {
                        ...allOperations(() => extendFactory(getAbilityFactory())),
                    },
                },
            })
            // if we are within a transaction, return client with transaction
            //@ts-ignore
            const transactionId = Prisma.getExtensionContext(this)[Symbol.for('prisma.client.transaction.id')]
            if (transactionId) {
                //@ts-ignore
                const transactionClient = extendedClient._createItxClient({
                    kind: 'itx',
                    id: transactionId
                }) as typeof extendedClient
                //@ts-ignore
                transactionClient.$casl = extendCaslAbilities
                // if $transaction is called on already existing transaction client, just use current transaction
                transactionClient.$transaction = async (first: any) => {
                    return first(transactionClient)
                }
                return transactionClient
            }
            //@ts-ignore
            extendedClient.$casl = extendCaslAbilities
            return extendedClient
        }


        const allOperations = (getAbilities: () => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => ({
            async $allOperations<T>({ args, query, model, operation, ...rest }: { args: any, query: any, model: any, operation: any }) {

                const { fluentModel, fluentRelationModel, fluentRelationField } = getFluentModel(model, rest)

                const __internalParams = (rest as any).__internalParams
                const transaction = __internalParams.transaction
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
                const hash = transaction?.id ?? 'batch'

                if (!batches[hash]) {
                    batches[hash] = []
                }

                // make sure, that we only tick once at a time
                if (!tickActive) {
                    tickActive = true;
                    process.nextTick(() => {
                        dispatchBatches(transaction);
                        tickActive = false;
                    });
                }
                /** batchQuery collects query within batches that will be dispatched every tick */
                const batchQuery = (
                    model: string,
                    action: string,
                    args: any,
                    callback: (result: any) => void
                ) => new Promise((resolve, reject) => {
                    batches[hash].push({
                        params: __internalParams,
                        model,
                        action,
                        args,
                        reject,
                        resolve,
                        callback,
                    })
                });


                if (operationAbility.action === 'update' || operationAbility.action === 'create' || operation === 'deleteMany') {
                    /**
                     *  we get all update/deleteMany entries for logging purposes.
                     */
                    // const getMany = operation === 'deleteMany' || operation === 'updateMany'

                    // const manyResult: any[] = getMany ? await batchQuery(model, 'findMany', caslQuery.args.where ? { where: caslQuery.args.where } : undefined, (res: any[]) => {
                    //     /** create update objects for updateMany */
                    //     return operation === 'updateMany' ? res.map((r) => ({ ...caslQuery.args.data, id: r.id })) : res
                    // }) : []
                    /**
                     *  we use createManyAndReturn instead of createMany createMany entries for logging purposes and to check permissions on new entries
                     */
                    const op = operation === 'createMany' ? 'createManyAndReturn' : operation === 'updateMany' ? 'updateManyAndReturn' : operation
                    return batchQuery(model, op, caslQuery.args, async (result: any) => {

                        const filteredResult = cleanupResults(result)//getMany ? manyResult : result)
                        const results = operation === 'createMany' || operation === 'deleteMany' || operation === 'updateMany'
                            ? { count: result.length }
                            // : getMany ? { count: manyResult.length }
                            : filteredResult
                        return results
                    })
                } else {

                    return batchQuery(model, operation, caslQuery.args, async (result: any) => {

                        const fluentField = getFluentField(rest)
                        if (fluentField) {
                            return cleanupResults(result?.[fluentField])
                        }
                        return cleanupResults(result)
                    })
                }



            }
        })


            // Derived from yates
            // https://github.com/cerebruminc/yates/blob/master/src/index.ts#L227
            //
            // By default, Prisma will batch requests by the transaction ID if it is present.
            // This behaviour prevents automatic batching from working when using this client extension, since all queries are executed inside an interactive transaction.
            // To get around this we monkey patch the batching function to use the batch ID and transaction ID.
            // To get the batching to work we also need to ensure that all the requests we might want to batch together are generated inside the same tick.
            // This means that all the requests per-tick that have the same role and context values will be batched together,
            // allowing the in-built prisma batch optimizations to work for us.
            // This is why we use process.nextTick and the tickActive flag to ensure we only tick once at a time.
            // See:
            // - https://github.com/prisma/prisma/blob/5.21.1/packages/client/src/runtime/RequestHandler.ts#L122
            // - https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance
            ; (client as any)._requestHandler.dataloader.options.batchBy = (
                request: any,
            ) => {
                const batchId = getBatchId(request.protocolQuery);
                if (request.transaction?.id) {
                    return `transaction-${request.transaction.id}${batchId ? `-${batchId}` : ""
                        }`;
                }

                return batchId
            };

        /** 
         * Derived from yates
        * https://github.com/cerebruminc/yates/blob/master/src/index.ts#L227
        *
        * This function is called once per tick, and processes all the batches that have been created during that tick.
        * If the batch happened within an existing transaction, we use it to recreate its client, so we keep its interactve transaction logic
        **/
        const dispatchBatches = (transaction?: { kind: 'itx' | 'batch' }) => {
            for (const [key, batch] of Object.entries(batches)) {
                delete batches[key];

                const runBatchTransaction = async (tx: any) => {
                    if (opts?.beforeQuery) {
                        await opts.beforeQuery(tx as any)
                    }

                    const results = await Promise.all(
                        batch.map((request: any) => {
                            //@ts-ignore
                            return tx[request.model][request.action](request.args).then((res) => request.callback(res))
                                .catch((e: Error) => {
                                    throw (e)
                                })

                        }),
                    );
                    // Switch role back to admin user
                    if (opts?.afterQuery) {
                        await opts?.afterQuery(tx as any)
                    }

                    return results;
                }

                new Promise((resolve, reject) => {
                    if (transaction && transaction.kind === 'itx') {
                        runBatchTransaction((client as any)._createItxClient(transaction)).then(resolve).catch(reject)
                    } else {
                        client.$transaction(async (tx) => {
                            return runBatchTransaction(tx);
                        }, {
                            maxWait: txMaxWait,
                            timeout: txTimeout,
                        }).then(resolve).catch(reject)
                    }
                }).then((results: any) => {
                    results.forEach((result: any, index: number) => {
                        batch[index].resolve(result);
                    });
                })
                    .catch((e) => {
                        for (const request of batch) {
                            request.reject(e);
                        }
                        delete batches[key]
                    })
            }
        };


        return client.$extends({
            name: "prisma-extension-casl",
            client: {
                $casl: extendCaslAbilities
            },
            query: {
                $allModels: {
                    ...allOperations(getAbilityFactory)
                },
            }
        })
    })
}



/**
 * recreates getBatchId from prisma
 * //https://github.com/prisma/prisma/blob/1a9ef0fbd3948ee708add6816a33743e1ff7df9c/packages/client/src/runtime/core/jsonProtocol/getBatchId.ts#L4
 * 
 * @param query 
 * @returns 
 */
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

