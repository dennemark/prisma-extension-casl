import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { PureAbility, AbilityTuple, AbilityBuilder } from '@casl/ability';
import { PrismaQuery } from '@casl/prisma';
import { Prisma } from '@prisma/client';

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
                $casl: () => (extendFactory: (factory: AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => {
                    $connect?: (() => Promise<void>) | undefined;
                    $disconnect?: (() => Promise<void>) | undefined;
                    $transaction?: {
                        <P extends _prisma_client_runtime_library.PrismaPromise<any>[]>(arg: [...P], options?: {
                            isolationLevel?: "Serializable" | undefined;
                        } | undefined): Promise<_prisma_client_runtime_library.UnwrapTuple<P>>;
                        <R>(fn: (client: Omit<_prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, {}>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">) => Promise<R>, options?: {
                            maxWait?: number;
                            timeout?: number;
                            isolationLevel?: "Serializable" | undefined;
                        } | undefined): Promise<R>;
                    } | undefined;
                    $extends?: _prisma_client_runtime_library.ExtendsHook<"extends", Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, {}> | undefined;
                } & {
                    [x: symbol]: {
                        types: {
                            payload: any;
                            operations: {
                                $executeRawUnsafe: {
                                    args: [query: string, ...values: any[]];
                                    result: any;
                                };
                                $executeRaw: {
                                    args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
                                    result: any;
                                };
                                $queryRawUnsafe: {
                                    args: [query: string, ...values: any[]];
                                    result: any;
                                };
                                $queryRaw: {
                                    args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
                                    result: any;
                                };
                            };
                        };
                    };
                    $executeRaw: <R = number>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                    $executeRawUnsafe: <R = number>(query: string, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                    $queryRaw: <R = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                    $queryRawUnsafe: <R = unknown>(query: string, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                    user: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "User", _prisma_client_runtime_library.DefaultArgs, {}>;
                    topic: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Topic", _prisma_client_runtime_library.DefaultArgs, {}>;
                    thread: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Thread", _prisma_client_runtime_library.DefaultArgs, {}>;
                    post: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Post", _prisma_client_runtime_library.DefaultArgs, {}>;
                } & {
                    $parent: _prisma_client_runtime_library.Optional<_prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, {}>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">;
                } & {
                    $casl: unknown;
                } & {
                    [K: symbol]: {
                        ctx: {
                            $connect?: (() => Promise<void>) | undefined;
                            $disconnect?: (() => Promise<void>) | undefined;
                            $transaction?: {
                                <P extends _prisma_client_runtime_library.PrismaPromise<any>[]>(arg: [...P], options?: {
                                    isolationLevel?: "Serializable" | undefined;
                                } | undefined): Promise<_prisma_client_runtime_library.UnwrapTuple<P>>;
                                <R>(fn: (client: Omit<_prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, {}>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">) => Promise<R>, options?: {
                                    maxWait?: number;
                                    timeout?: number;
                                    isolationLevel?: "Serializable" | undefined;
                                } | undefined): Promise<R>;
                            } | undefined;
                            $extends?: _prisma_client_runtime_library.ExtendsHook<"extends", Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, {}> | undefined;
                        } & {
                            [x: symbol]: {
                                types: {
                                    payload: any;
                                    operations: {
                                        $executeRawUnsafe: {
                                            args: [query: string, ...values: any[]];
                                            result: any;
                                        };
                                        $executeRaw: {
                                            args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
                                            result: any;
                                        };
                                        $queryRawUnsafe: {
                                            args: [query: string, ...values: any[]];
                                            result: any;
                                        };
                                        $queryRaw: {
                                            args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
                                            result: any;
                                        };
                                    };
                                };
                            };
                            $executeRaw: <R = number>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                            $executeRawUnsafe: <R = number>(query: string, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                            $queryRaw: <R = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                            $queryRawUnsafe: <R = unknown>(query: string, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                            user: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "User", _prisma_client_runtime_library.DefaultArgs, {}>;
                            topic: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Topic", _prisma_client_runtime_library.DefaultArgs, {}>;
                            thread: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Thread", _prisma_client_runtime_library.DefaultArgs, {}>;
                            post: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Post", _prisma_client_runtime_library.DefaultArgs, {}>;
                        } & {
                            $parent: _prisma_client_runtime_library.Optional<_prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, {}>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">;
                        };
                    };
                } & {
                    $casl(extendFactory: (factory: AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>) => AbilityBuilder<PureAbility<AbilityTuple, PrismaQuery>>): {
                        $connect?: (() => Promise<void>) | undefined;
                        $disconnect?: (() => Promise<void>) | undefined;
                        $transaction?: {
                            <P extends _prisma_client_runtime_library.PrismaPromise<any>[]>(arg: [...P], options?: {
                                isolationLevel?: "Serializable" | undefined;
                            } | undefined): Promise<_prisma_client_runtime_library.UnwrapTuple<P>>;
                            <R>(fn: (client: Omit<_prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, {}>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">) => Promise<R>, options?: {
                                maxWait?: number;
                                timeout?: number;
                                isolationLevel?: "Serializable" | undefined;
                            } | undefined): Promise<R>;
                        } | undefined;
                        $extends?: _prisma_client_runtime_library.ExtendsHook<"extends", Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, {}> | undefined;
                    } & {
                        [x: symbol]: {
                            types: {
                                payload: any;
                                operations: {
                                    $executeRawUnsafe: {
                                        args: [query: string, ...values: any[]];
                                        result: any;
                                    };
                                    $executeRaw: {
                                        args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
                                        result: any;
                                    };
                                    $queryRawUnsafe: {
                                        args: [query: string, ...values: any[]];
                                        result: any;
                                    };
                                    $queryRaw: {
                                        args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
                                        result: any;
                                    };
                                };
                            };
                        };
                        $executeRaw: <R = number>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                        $executeRawUnsafe: <R = number>(query: string, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                        $queryRaw: <R = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                        $queryRawUnsafe: <R = unknown>(query: string, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                        user: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "User", _prisma_client_runtime_library.DefaultArgs, {}>;
                        topic: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Topic", _prisma_client_runtime_library.DefaultArgs, {}>;
                        thread: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Thread", _prisma_client_runtime_library.DefaultArgs, {}>;
                        post: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Post", _prisma_client_runtime_library.DefaultArgs, {}>;
                    } & {
                        $parent: _prisma_client_runtime_library.Optional<_prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, {}>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">;
                    } & {
                        $casl: unknown;
                    } & {
                        [K: symbol]: {
                            ctx: {
                                $connect?: (() => Promise<void>) | undefined;
                                $disconnect?: (() => Promise<void>) | undefined;
                                $transaction?: {
                                    <P extends _prisma_client_runtime_library.PrismaPromise<any>[]>(arg: [...P], options?: {
                                        isolationLevel?: "Serializable" | undefined;
                                    } | undefined): Promise<_prisma_client_runtime_library.UnwrapTuple<P>>;
                                    <R>(fn: (client: Omit<_prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, {}>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">) => Promise<R>, options?: {
                                        maxWait?: number;
                                        timeout?: number;
                                        isolationLevel?: "Serializable" | undefined;
                                    } | undefined): Promise<R>;
                                } | undefined;
                                $extends?: _prisma_client_runtime_library.ExtendsHook<"extends", Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, {}> | undefined;
                            } & {
                                [x: symbol]: {
                                    types: {
                                        payload: any;
                                        operations: {
                                            $executeRawUnsafe: {
                                                args: [query: string, ...values: any[]];
                                                result: any;
                                            };
                                            $executeRaw: {
                                                args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
                                                result: any;
                                            };
                                            $queryRawUnsafe: {
                                                args: [query: string, ...values: any[]];
                                                result: any;
                                            };
                                            $queryRaw: {
                                                args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
                                                result: any;
                                            };
                                        };
                                    };
                                };
                                $executeRaw: <R = number>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                                $executeRawUnsafe: <R = number>(query: string, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                                $queryRaw: <R = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                                $queryRawUnsafe: <R = unknown>(query: string, ...values: any[]) => _prisma_client_runtime_library.PrismaPromise<R>;
                                user: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "User", _prisma_client_runtime_library.DefaultArgs, {}>;
                                topic: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Topic", _prisma_client_runtime_library.DefaultArgs, {}>;
                                thread: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Thread", _prisma_client_runtime_library.DefaultArgs, {}>;
                                post: _prisma_client_runtime_library.DynamicModelExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, "Post", _prisma_client_runtime_library.DefaultArgs, {}>;
                            } & {
                                $parent: _prisma_client_runtime_library.Optional<_prisma_client_runtime_library.DynamicClientExtensionThis<Prisma.TypeMap<_prisma_client_runtime_library.InternalArgs & _prisma_client_runtime_library.DefaultArgs, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, _prisma_client_runtime_library.DefaultArgs, {}>, "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">;
                            };
                        };
                    } & any & {
                        name?: string;
                        $name?: string;
                        $parent?: unknown;
                    };
                } & {
                    name?: string;
                    $name?: string;
                    $parent?: unknown;
                };
            };
        };
    };
};

export { applyCaslToQuery, useCaslAbilities };
