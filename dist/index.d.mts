import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { PureAbility, AbilityTuple } from '@casl/ability';
import { PrismaQuery } from '@casl/prisma';

type DefaultCaslAction = "create" | "read" | "update" | "delete";
type PrismaCaslOperation = 'create' | 'createMany' | 'createManyAndReturn' | 'upsert' | 'findFirst' | 'findFirstOrThrow' | 'findMany' | 'findUnique' | 'findUniqueOrThrow' | 'aggregate' | 'count' | 'groupBy' | 'update' | 'updateMany' | 'delete' | 'deleteMany';
declare const caslOperationDict: Record<PrismaCaslOperation, {
    action: DefaultCaslAction;
    dataQuery: boolean;
    whereQuery: boolean;
    includeSelectQuery: boolean;
}>;
declare const useCaslAbilities: (abilities: PureAbility<AbilityTuple, PrismaQuery>) => (client: any) => {
    $extends: {
        extArgs: _prisma_client_runtime_library.InternalArgs<unknown, unknown, {}, unknown>;
    };
};
declare function applyCaslToQuery(operation: any, args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: Prisma.ModelName): any;
declare function applyDataQuery(abilities: PureAbility<AbilityTuple, PrismaQuery>, args: any, action: string, model: string): any;
declare function applyWhereQuery(abilities: PureAbility<AbilityTuple, PrismaQuery>, args: any, action: string, model: string, relation?: string): any;
declare const applySelectPermittedFields: (abilities: PureAbility<AbilityTuple, PrismaQuery>, args: any, model: string) => any;
declare const applyIncludeSelectQuery: (abilities: PureAbility<AbilityTuple, PrismaQuery>, args: any, model: string) => any;
declare function capitalizeFirstLetter(string: string): string;
declare function isSubset(obj1: any, obj2: any): boolean;

export { type PrismaCaslOperation, applyCaslToQuery, applyDataQuery, applyIncludeSelectQuery, applySelectPermittedFields, applyWhereQuery, capitalizeFirstLetter, caslOperationDict, isSubset, useCaslAbilities };
