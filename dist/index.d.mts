import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { PureAbility, AbilityTuple } from '@casl/ability';
import { PrismaQuery } from '@casl/prisma';

/**
 * enrich a prisma client to check for CASL abilities even in nested queries
 *
 * `client.$extends(useCaslAbilities(build))`
 *
 * https://casl.js.org/v6/en/package/casl-prisma
 *
 *
 * @param getAbilities function to return CASL prisma abilities - this is a function call to instantiate abilities on client call with i.e. context and claims
 * @returns enriched prisma client
 */
declare const useCaslAbilities: (getAbilities: () => PureAbility<AbilityTuple, PrismaQuery>) => (client: any) => {
    $extends: {
        extArgs: _prisma_client_runtime_library.InternalArgs<unknown, unknown, {}, unknown>;
    };
};

export { useCaslAbilities };
