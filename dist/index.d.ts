import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { PureAbility, AbilityTuple, AbilityBuilder } from '@casl/ability';
import { PrismaQuery } from '@casl/prisma';
import { Prisma } from '@prisma/client';

type CreationTree = {
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

type PrismaExtensionCaslOptions = {
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
};
type PrismaCaslOperation = 'create' | 'createMany' | 'createManyAndReturn' | 'upsert' | 'findFirst' | 'findFirstOrThrow' | 'findMany' | 'findUnique' | 'findUniqueOrThrow' | 'aggregate' | 'count' | 'groupBy' | 'update' | 'updateMany' | 'delete' | 'deleteMany';

/**
 * Applies CASL authorization logic to prisma query
 *
 * @param operation Prisma Operation `findUnique` etc
 * @param args Prisma query
 * @param abilities Casl prisma abilities
 * @param model Prisma model
 * @returns Enriched query with casl authorization
 */
declare function applyCaslToQuery(operation: PrismaCaslOperation, args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: Prisma.ModelName, queryAllRuleRelations?: boolean): {
    creationTree: CreationTree | undefined;
    args: any;
    mask: Record<string, any>;
} | {
    args: any;
    mask: undefined;
    creationTree: CreationTree | undefined;
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
declare function useCaslAbilities(getAbilityFactory: () => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>, opts?: PrismaExtensionCaslOptions): (client: any) => {
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
                }, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, {
                    result: {};
                    model: {};
                    query: {};
                    client: {};
                }, {}>;
            };
        };
    };
};

export { applyCaslToQuery, useCaslAbilities };
