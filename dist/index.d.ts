import { PureAbility, AbilityTuple, AbilityBuilder } from '@casl/ability';
import { PrismaQuery } from '@casl/prisma';
import { Prisma } from '@prisma/client';
import { DynamicClientExtensionThis, InternalArgs } from '@prisma/client/runtime/library';

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
declare function applyCaslToQuery(operation: PrismaCaslOperation, args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: Prisma.ModelName): {
    args: any;
    mask: Record<string, any>;
} | {
    args: any;
    mask: undefined;
};

type CaslExtensionType = DynamicClientExtensionThis<Prisma.TypeMap<InternalArgs & {
    result: {};
    model: {};
    query: {};
    client: {};
}>, Prisma.TypeMapCb, {
    result: {};
    model: {};
    query: {};
    client: {};
}, {}>;
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
declare function useCaslAbilities(getAbilityFactory: () => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>): (client: any) => {
    $extends: {
        extArgs: {
            result: {};
            model: {};
            query: {};
            client: {
                $casl: () => (extendFactory: (factory: AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => CaslExtensionType;
            };
        };
    };
};

export { applyCaslToQuery, useCaslAbilities };
