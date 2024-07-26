import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { PureAbility, AbilityTuple } from '@casl/ability';
import { PrismaQuery } from '@casl/prisma';

/**
 * enrich a prisma client to check for CASL abilities even in nested queries
 *
 * `client.$extends(useCaslAbilities(build()))`
 *
 * https://casl.js.org/v6/en/package/casl-prisma
 *
 *
 * @param abilities CASL prisma abilities
 * @returns enriched prisma client
 */
declare const useCaslAbilities: (abilities: PureAbility<AbilityTuple, PrismaQuery>) => (client: any) => {
    $extends: {
        extArgs: _prisma_client_runtime_library.InternalArgs<unknown, unknown, {}, unknown>;
    };
};

export { useCaslAbilities };
