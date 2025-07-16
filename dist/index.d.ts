import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { PureAbility, AbilityTuple, AbilityBuilder } from '@casl/ability';
import { PrismaQuery } from '@casl/prisma';
import { Prisma } from '@prisma/client';

type CreationTree<M extends Prisma.ModelName = Prisma.ModelName> = {
    action: string;
    model: Prisma.ModelName;
    children: Record<string, CreationTree>;
    /**
     * mutation query for creation / update
     * with fields that are modified on mutation
     * and the where query
     *
     * we use the where query to see which entries have been modified
     * and the check accessibleBy per field
     * to see if mutations are forbidden
     */
    mutation: {
        fields: string[];
        where: any;
    }[];
};

type PrismaExtensionCaslOptions<T extends typeof Prisma = typeof Prisma> = {
    /**
     * will add a field on each returned prisma result that stores allowed actions on result (not nested)
     * so instead of { id: 0 } it would return { id: 0, [permissionField]: ['create', 'read', 'update', 'delete'] }
     *
     * to return other actions, please use addPermissionActions
     */
    permissionField?: string;
    /**
     * adds additional permission actions to ['create', 'read', 'update', 'delete']
     * that should be returned if permissionField is used.
     */
    addPermissionActions?: string[];
    /** uses transaction to allow using client queries before actual query, if fails, whole query will be rolled back */
    beforeQuery?: (tx: Prisma.TransactionClient) => Promise<void>;
    /** uses transaction to allow using client queries after actual query, if fails, whole query will be rolled back */
    afterQuery?: (tx: Prisma.TransactionClient) => Promise<void>;
    /** max wait for batch transaction - default 30000 */
    txMaxWait?: number;
    /** timeout for batch transaction - default 30000 */
    txTimeout?: number;
    prismaInstance?: T;
};
type PrismaCaslOperation = 'create' | 'createMany' | 'createManyAndReturn' | 'upsert' | 'findFirst' | 'findFirstOrThrow' | 'findMany' | 'findUnique' | 'findUniqueOrThrow' | 'aggregate' | 'count' | 'groupBy' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'delete' | 'deleteMany';

/**
 * Applies CASL authorization logic to prisma query
 *
 * @param operation Prisma Operation `findUnique` etc
 * @param args Prisma query
 * @param abilities Casl prisma abilities
 * @param model Prisma model
 * @returns Enriched query with casl authorization
 */
declare function applyCaslToQuery<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, operation: PrismaCaslOperation, args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: M, queryAllRuleRelations?: boolean): {
    creationTree: CreationTree<M> | undefined;
    args: any;
    mask: Record<string, any>;
} | {
    args: any;
    mask: undefined;
    creationTree: CreationTree<M> | undefined;
};

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
declare function useCaslAbilities<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(getAbilityFactory: () => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>, opts?: PrismaExtensionCaslOptions<T>): (client: any) => {
    $extends: {
        extArgs: {
            result: {};
            model: {};
            query: {};
            client: {
                $casl: () => (extendFactory: (factory: AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => _prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & {
                    result: {};
                    model: {};
                    query: {};
                    client: {};
                }, {}>, Prisma.TypeMapCb<{}>, {
                    result: {};
                    model: {};
                    query: {};
                    client: {};
                }>;
            };
        };
    };
};
/**
 * recreates getBatchId from prisma
 * //https://github.com/prisma/prisma/blob/1a9ef0fbd3948ee708add6816a33743e1ff7df9c/packages/client/src/runtime/core/jsonProtocol/getBatchId.ts#L4
 *
 * @param query
 * @returns
 */
declare function getBatchId(query: any): string | undefined;

export { applyCaslToQuery, getBatchId, useCaslAbilities };
