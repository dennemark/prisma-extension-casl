// src/index.ts
import { createCaslExtension } from "@casl/prisma";
import { Prisma } from "@prisma/client/extension";

// src/applyCaslToQuery.ts
import { accessibleBy as accessibleBy3 } from "@casl/prisma";

// src/applyDataQuery.ts
import { accessibleBy as accessibleBy2, createPrismaAbility } from "@casl/prisma";

// src/applyAccessibleQuery.ts
function applyAccessibleQuery(query, accessibleQuery) {
  if (accessibleQuery && Object.keys(accessibleQuery).length > 0) {
    return {
      ...query,
      AND: [
        ...query.AND ?? [],
        accessibleQuery
      ]
    };
  } else {
    return query;
  }
}

// src/applyWhereQuery.ts
import { accessibleBy } from "@casl/prisma";

// src/helpers.ts
import { subject } from "@casl/ability";
import { permittedFieldsOf } from "@casl/ability/extra";
var caslOperationDict = {
  create: { action: "create", dataQuery: true, whereQuery: false, includeSelectQuery: true },
  createMany: { action: "create", dataQuery: true, whereQuery: false, includeSelectQuery: true },
  createManyAndReturn: { action: "create", dataQuery: true, whereQuery: false, includeSelectQuery: true },
  upsert: { action: "create", dataQuery: true, whereQuery: true, includeSelectQuery: true },
  findFirst: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  findFirstOrThrow: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  findMany: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  findUnique: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  findUniqueOrThrow: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  aggregate: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: false },
  count: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: false },
  groupBy: { action: "read", dataQuery: false, whereQuery: true, includeSelectQuery: false },
  update: { action: "update", dataQuery: true, whereQuery: true, includeSelectQuery: true },
  updateMany: { action: "update", dataQuery: true, whereQuery: true, includeSelectQuery: false },
  updateManyAndReturn: { action: "update", dataQuery: true, whereQuery: true, includeSelectQuery: false },
  delete: { action: "delete", dataQuery: false, whereQuery: true, includeSelectQuery: true },
  deleteMany: { action: "delete", dataQuery: false, whereQuery: true, includeSelectQuery: false }
};
var caslNestedOperationDict = {
  upsert: "create",
  connect: "update",
  connectOrCreate: "create",
  create: "create",
  createMany: "create",
  update: "update",
  updateMany: "update",
  delete: "delete",
  deleteMany: "delete",
  disconnect: "update",
  set: "update"
};
var relationFieldsByModel = {};
var propertyFieldsByModel = {};
var modelFieldsByModel = {};
var subjectFieldsByModel = {};
function pick(obj, keys) {
  return keys.reduce((acc, val) => {
    if (obj && val in obj) {
      acc[val] = obj[val];
    }
    return acc;
  }, {});
}
function getPermittedFields(abilities, action, model, obj) {
  const modelFields = modelFieldsByModel[model];
  const permittedFields = permittedFieldsOf(abilities, action, obj ? getSubject(model, obj) : model, {
    fieldsFrom: (rule) => {
      return rule.fields || [...modelFields];
    }
  });
  return permittedFields;
}
function getSubject(model, obj) {
  const subjectFields = subjectFieldsByModel[model];
  return subject(model, pick(obj, subjectFields));
}
function getFluentField(data) {
  const dataPath = data?.__internalParams?.dataPath;
  if (dataPath?.length > 0) {
    return dataPath[dataPath.length - 1];
  } else {
    return void 0;
  }
}
function getFluentModel(startModel, data) {
  const startRelation = {
    fluentModel: startModel,
    fluentRelationField: void 0,
    fluentRelationModel: void 0
  };
  const dataPath = data?.__internalParams?.dataPath;
  if (dataPath?.length > 0) {
    return dataPath.filter((x) => x !== "select").reduce((acc, x) => {
      acc.fluentRelationField = relationFieldsByModel[acc.fluentModel][x];
      acc.fluentModel = acc.fluentRelationField.type;
      acc.fluentRelationModel = x;
      return acc;
    }, startRelation);
  } else {
    return startRelation;
  }
}
function isSubset(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 === "object" && typeof obj2 === "object") {
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      for (const item1 of obj1) {
        let found = false;
        for (const item2 of obj2) {
          if (isSubset(item1, item2)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      return true;
    } else {
      for (const key in obj1) {
        if (!(key in obj2) || !isSubset(obj1[key], obj2[key])) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
}

// src/applyWhereQuery.ts
function applyWhereQuery(abilities, args, action, model, relation, requiredRelation) {
  if (!(model in relationFieldsByModel)) {
    throw new Error(`Model ${model} does not exist on Prisma Client`);
  }
  if (!abilities.can(action, model)) {
    throw new Error(`It's not allowed to "${action}" on "${model}"`);
  }
  const accessibleQuery = accessibleBy(abilities, action).ofType(model);
  if (Object.keys(accessibleQuery).length > 0) {
    if (args === true) {
      args = {};
    }
    if (!args.where) {
      args.where = {};
    }
    const relationQuery = relation && accessibleQuery ? requiredRelation ? { [relation]: accessibleQuery } : { OR: [{ [relation]: null }, { [relation]: accessibleQuery }] } : accessibleQuery;
    args.where = applyAccessibleQuery(args.where, relationQuery);
  }
  return args;
}

// src/polyfills.ts
if (!Set.prototype.isSubsetOf) {
  Set.prototype.isSubsetOf = function(set) {
    for (let elem of this) {
      if (!set.has(elem)) {
        return false;
      }
    }
    return true;
  };
}
if (!Set.prototype.isDisjointFrom) {
  Set.prototype.isDisjointFrom = function(set) {
    for (let elem of this) {
      if (set.has(elem)) {
        return false;
      }
    }
    return true;
  };
}

// src/applyDataQuery.ts
function applyDataQuery(abilities, args, operation, action, model, creationTree) {
  const tree = creationTree ? creationTree : { action, model, children: {}, mutation: [] };
  const permittedFields = getPermittedFields(abilities, action, model);
  const mutationArgs = [];
  (Array.isArray(args) ? args : [args]).map((argsEntry) => {
    let hasWhereQuery = false;
    ["update", "create", "data"].forEach((nestedAction) => {
      if (nestedAction in argsEntry) {
        const nestedArgs = Array.isArray(argsEntry[nestedAction]) ? argsEntry[nestedAction] : [argsEntry[nestedAction]];
        mutationArgs.push(...nestedArgs);
        if (!hasWhereQuery && "where" in argsEntry) {
          hasWhereQuery = true;
          const argFields = /* @__PURE__ */ new Set();
          for (const arg of nestedArgs) {
            for (const field in arg) {
              if (field in propertyFieldsByModel[model]) {
                argFields.add(field);
              }
            }
          }
          tree.mutation.push({ fields: [...argFields], where: argsEntry.where });
          const nestedAbilities = createPrismaAbility(abilities.rules.filter((rule) => {
            if (rule.fields && rule.subject === model) {
              if (rule.inverted) {
                return argFields.isDisjointFrom(new Set(rule.fields));
              } else {
                return argFields.isSubsetOf(new Set(Array.isArray(rule.fields) ? rule.fields : [rule.fields]));
              }
            } else {
              return true;
            }
          }));
          applyWhereQuery(nestedAbilities, argsEntry, nestedAction !== "update" && nestedAction !== "create" ? action : "update", model);
        }
      }
    });
    if (mutationArgs.length === 0) {
      mutationArgs.push(argsEntry);
    }
  });
  mutationArgs.map((mutation) => {
    const queriedFields = (mutation ? Object.keys(mutation) : []).map((field) => {
      const relationModelId = propertyFieldsByModel[model][field];
      if (relationModelId && mutation[field] !== null) {
        const fieldId = relationFieldsByModel[model][relationModelId].relationToFields?.[0];
        if (fieldId && operation !== "createMany" && operation !== "createManyAndReturn") {
          mutation[relationModelId] = { connect: { [fieldId]: mutation[field] } };
          delete mutation[field];
        }
        return relationModelId;
      } else {
        return field;
      }
    });
    queriedFields.forEach((field) => {
      const relationModel = relationFieldsByModel[model][field];
      if (permittedFields?.includes(field) === false && !relationModel) {
        throw new Error(`It's not allowed to "${action}" "${field}" on "${model}"`);
      } else if (relationModel && mutation[field]) {
        for (const nestedAction in mutation[field]) {
          const nestedArgs = mutation[field][nestedAction];
          if (nestedAction in caslNestedOperationDict) {
            const mutationAction = caslNestedOperationDict[nestedAction];
            const isConnection = nestedAction === "connect" || nestedAction === "disconnect";
            tree.children[field] = { action: mutationAction, model: relationModel.type, children: {}, mutation: [] };
            if (nestedAction !== "disconnect" && nestedArgs !== true) {
              const dataQuery = applyDataQuery(abilities, nestedArgs, operation, mutationAction, relationModel.type, tree.children[field]);
              mutation[field][nestedAction] = dataQuery.args;
              if (isConnection) {
                const accessibleQuery = accessibleBy2(abilities, mutationAction).ofType(relationModel.type);
                if (Array.isArray(mutation[field][nestedAction])) {
                  mutation[field][nestedAction] = mutation[field][nestedAction].map((q) => applyAccessibleQuery(q, accessibleQuery));
                } else {
                  mutation[field][nestedAction] = applyAccessibleQuery(mutation[field][nestedAction], accessibleQuery);
                }
              }
            }
          } else {
            throw new Error(`Unknown nested action ${nestedAction} on ${model}`);
          }
        }
      }
    });
  });
  return { args, creationTree: tree };
}

// src/applyIncludeSelectQuery.ts
function applyIncludeSelectQuery(abilities, args, model) {
  ;
  ["include", "select"].forEach((method) => {
    if (args && args[method]) {
      for (const relation in args[method]) {
        if (model in relationFieldsByModel && relation in relationFieldsByModel[model]) {
          const relationField = relationFieldsByModel[model][relation];
          if (relationField) {
            if (relationField.isList) {
              if (!abilities.can("read", relationField.type)) {
                delete args[method][relation];
                continue;
              }
              try {
                const methodQuery = applyWhereQuery(abilities, args[method][relation], "read", relationField.type);
                args[method][relation] = methodQuery.select && Object.keys(methodQuery.select).length === 0 ? false : methodQuery;
              } catch (e) {
                delete args[method][relation];
                continue;
              }
            }
            args[method][relation] = applyIncludeSelectQuery(abilities, args[method][relation], relationField.type);
          }
        } else if (relation === "_count") {
          args[method][relation] = applyIncludeSelectQuery(abilities, args[method][relation], model);
        }
      }
    }
  });
  return args;
}

// src/applyRuleRelationsQuery.ts
import { rulesToAST as rulesToAST2 } from "@casl/ability/extra";
import { createPrismaAbility as createPrismaAbility2 } from "@casl/prisma";

// src/convertCreationTreeToSelect.ts
import { rulesToAST } from "@casl/ability/extra";

// src/getRuleRelationsQuery.ts
function flattenAst(ast) {
  if (["and", "or"].includes(ast.operator.toLowerCase())) {
    return ast.value.flatMap((childAst) => flattenAst(childAst));
  } else {
    return [ast];
  }
}
function getRuleRelationsQuery(model, ast, dataRelationQuery = {}) {
  const obj = dataRelationQuery;
  if (ast) {
    if (typeof ast.value === "object") {
      flattenAst(ast).map((childAst) => {
        const relation = relationFieldsByModel[model];
        if (childAst.field) {
          if (childAst.field in relation) {
            const dataInclude = obj[childAst.field] !== void 0 ? obj[childAst.field] : {};
            const relQuery = getRuleRelationsQuery(relation[childAst.field].type, childAst.value, dataInclude === true ? {} : dataInclude.select);
            if (relQuery && Object.keys(relQuery).length > 0) {
              obj[childAst.field] = {
                select: relQuery
              };
            } else {
              obj[childAst.field] = true;
            }
          } else {
            obj[childAst.field] = true;
          }
        }
      });
    } else {
      obj[ast.field] = true;
    }
  }
  return obj;
}

// src/convertCreationTreeToSelect.ts
function convertCreationTreeToSelect(abilities, relationQuery) {
  let relationResult = {};
  if (relationQuery.action === "create") {
    const ast = rulesToAST(abilities, relationQuery.action, relationQuery.model);
    relationResult = getRuleRelationsQuery(relationQuery.model, ast, {});
  }
  if (Object.keys(relationQuery.children).length === 0) {
    return relationQuery.action === "create" ? relationResult : null;
  }
  for (const key in relationQuery.children) {
    const childRelation = convertCreationTreeToSelect(abilities, relationQuery.children[key]);
    if (childRelation !== null) {
      relationResult[key] = { select: childRelation };
    }
  }
  return Object.keys(relationResult).length > 0 ? relationResult : relationQuery.action === "create" ? {} : null;
}

// src/deepMerge.ts
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}
function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return deepMerge(target, ...sources);
}

// src/applyRuleRelationsQuery.ts
function mergeArgsAndRelationQuery(args, relationQuery) {
  const mask = {};
  let found = false;
  ["include", "select"].map((method) => {
    if (args[method]) {
      found = true;
      for (const key in relationQuery) {
        if (!(key in args[method])) {
          if (relationQuery[key].select) {
            args[method][key] = Object.keys(relationQuery[key].select).length === 0 ? true : relationQuery[key];
            mask[key] = true;
          } else if (method === "select") {
            args[method][key] = relationQuery[key];
            mask[key] = true;
          }
        } else if (args[method][key] && typeof args[method][key] === "object") {
          const child = relationQuery[key].select ? mergeArgsAndRelationQuery(args[method][key], relationQuery[key].select) : { args: args[method][key], mask: true };
          args[method][key] = child.args;
          mask[key] = child.mask;
        } else if (args[method][key] === true) {
          if (relationQuery[key].select) {
            for (const field in relationQuery[key].select) {
              if (relationQuery[key].select[field]?.select) {
                args[method][key] = {
                  include: {
                    ...args[method][key]?.include ?? {},
                    [field]: relationQuery[key].select[field]
                  }
                };
                mask[key] = {
                  ...mask?.[key] ?? {},
                  [field]: true
                };
              }
            }
          }
        }
      }
    }
  });
  if (found === false) {
    for (const k in relationQuery) {
      const v = relationQuery[k];
      if (v?.select) {
        args.include = {
          ...args.include ?? {},
          [k]: v
        };
        mask[k] = args.where ? true : removeNestedIncludeSelect(v.select);
      }
    }
  }
  return {
    args,
    mask
  };
}
function removeNestedIncludeSelect(args) {
  if (typeof args === "object") {
    const res = {};
    for (const k in args) {
      const v = args[k];
      if (v?.select) {
        res[k] = removeNestedIncludeSelect(v.select);
      } else if (v?.include) {
        res[k] = removeNestedIncludeSelect(v.include);
      } else {
        res[k] = v;
      }
    }
    return res;
  }
  return args;
}
function applyRuleRelationsQuery(args, abilities, action, model, creationTree) {
  const creationSelectQuery = creationTree ? convertCreationTreeToSelect(abilities, creationTree) ?? {} : {};
  const queryRelations = getNestedQueryRelations(args, abilities, action, model, creationSelectQuery === true ? {} : creationSelectQuery);
  if (!args.select && !args.include) {
    args.include = {};
  }
  const result = mergeArgsAndRelationQuery(args, queryRelations);
  if ("include" in result.args && Object.keys(result.args.include).length === 0) {
    delete result.args.include;
  }
  return { ...result, creationTree };
}
function getNestedQueryRelations(args, abilities, action, model, creationSelectQuery = {}) {
  const ability = createPrismaAbility2(abilities.rules.filter((rule) => rule.conditions).map((rule) => {
    return {
      ...rule,
      action: action === "all" ? action : rule.action,
      inverted: false
    };
  }));
  try {
    const ast = rulesToAST2(ability, action, model);
    const queryRelations = getRuleRelationsQuery(model, ast, creationSelectQuery === true ? {} : creationSelectQuery);
    ["include", "select"].map((method) => {
      if (args && args[method]) {
        for (const relation in args[method]) {
          if (model in relationFieldsByModel && relation in relationFieldsByModel[model]) {
            const relationField = relationFieldsByModel[model][relation];
            if (relationField) {
              const nestedQueryRelations = deepMerge(
                getNestedQueryRelations(args[method][relation], abilities, action === "all" ? "all" : "read", relationField.type),
                typeof queryRelations[relation]?.select === "object" ? queryRelations[relation]?.select : {}
              );
              if (nestedQueryRelations && Object.keys(nestedQueryRelations).length > 0) {
                queryRelations[relation] = {
                  ...queryRelations[relation] ?? {},
                  select: nestedQueryRelations
                };
              }
            }
          }
        }
      }
    });
    return queryRelations;
  } catch (e) {
    console.error(`Your ability relation probably is missing an 'is': [relation]: { is: { id: 0 } }`);
    throw e;
  }
}

// src/transformDataToWhereQuery.ts
function transformDataToWhereQuery(args, model) {
  ;
  ["connect", "disconnect"].forEach((action) => {
    for (const relation in args.data) {
      const obj = args.data[relation];
      if (typeof obj === "object" && !Array.isArray(obj) && obj[action]) {
        const ANDArgs = { AND: [...obj[action].AND ?? [], ...args.where[relation]?.AND ?? []] };
        const relationTo = relationFieldsByModel[model][relation].relationToFields?.[0];
        const relationFrom = relationFieldsByModel[model][relation].relationFromFields?.[0];
        if (!relationTo || !relationFrom) {
          throw new Error("Cannot find correct relations to transform updateMany to casl query.");
        }
        args.where = {
          ...args.where ?? {},
          [relation]: {
            ...args.where[relation] ?? {},
            ...obj[action],
            ...ANDArgs.AND.length > 0 ? ANDArgs : {}
          }
        };
        args.data = {
          ...args.data,
          [relationFrom]: obj[action][relationTo]
        };
        delete args.data[relation];
        delete args.where[relation][relationTo];
      }
    }
  });
  return args;
}

// src/applyCaslToQuery.ts
function applyCaslToQuery(operation, args, abilities, model, queryAllRuleRelations) {
  const operationAbility = caslOperationDict[operation];
  const accessibleQuery = accessibleBy3(abilities, operationAbility.action).ofType(model);
  let creationTree = void 0;
  if (operationAbility.dataQuery && args.data) {
    if (operationAbility.whereQuery && !args.where) {
      args.where = {};
    }
    const { args: dataArgs, creationTree: dataCreationTree } = applyDataQuery(abilities, args, operation, operationAbility.action, model);
    creationTree = dataCreationTree;
    args = dataArgs;
    if (operation === "updateMany" || operation === "updateManyAndReturn") {
      args = transformDataToWhereQuery(args, model);
    }
  } else if (operationAbility.whereQuery) {
    args = applyWhereQuery(abilities, args, operationAbility.action, model);
  }
  if (operationAbility.includeSelectQuery) {
    args = applyIncludeSelectQuery(abilities, args, model);
    if (!operationAbility.whereQuery && args.where) {
      delete args.where;
    }
  } else {
    delete args.include;
    delete args.select;
  }
  const result = operationAbility.includeSelectQuery ? applyRuleRelationsQuery(args, abilities, queryAllRuleRelations ? "all" : operationAbility.action, model, creationTree) : { args, mask: void 0, creationTree };
  return result;
}

// src/storePermissions.ts
function storePermissions(result, abilities, model, opts) {
  if (!opts?.permissionField) {
    return result;
  }
  const prop = opts.permissionField;
  const actions = ["create", "read", "update", "delete", ...opts?.addPermissionActions ?? []];
  const storeProp = (entry) => {
    if (entry) {
      entry[prop] = [];
      actions.forEach((action) => {
        if (abilities.can(action, getSubject(model, entry))) {
          entry[prop].push(action);
        }
      });
    }
    return entry;
  };
  if (Array.isArray(result)) {
    const res = result.map(storeProp);
    return res;
  } else {
    return storeProp(result);
  }
}

// src/filterQueryResults.ts
function filterQueryResults(result, mask, creationTree, abilities, model, operation, opts) {
  if (typeof result === "number") {
    return result;
  }
  if (!(model in relationFieldsByModel)) {
    throw new Error(`Model ${model} does not exist on Prisma Client`);
  }
  const operationFields = ["_min", "_max", "_avg", "_count", "_sum"];
  const filterPermittedFields = (entry) => {
    if (!entry) {
      return null;
    }
    if (creationTree?.action === "create") {
      try {
        if (creationTree.mutation?.length) {
          creationTree.mutation.forEach(({ where }) => {
            if (isSubset(where, entry)) {
              if (!abilities.can("create", getSubject(model, entry))) {
                throw new Error("");
              }
            }
          });
        } else {
          if (!abilities.can("create", getSubject(model, entry))) {
            throw new Error("");
          }
        }
      } catch (e) {
        throw new Error(`It's not allowed to create on ${model} ` + e);
      }
    }
    if (creationTree?.action === "update" && creationTree.mutation.length > 0) {
      creationTree.mutation.forEach(({ fields, where }) => {
        if (isSubset(where, entry)) {
          fields.forEach((field) => {
            try {
              if (!abilities.can("update", getSubject(model, entry), field)) {
                throw new Error(field);
              }
            } catch (e) {
              throw new Error(`It's not allowed to update ${field} on ${model} ` + e);
            }
          });
        }
      });
    }
    const permittedFields = getPermittedFields(abilities, "read", model, entry);
    let hasKeys = false;
    Object.keys(entry).filter((field) => {
      if (operationFields?.includes(field)) {
        hasKeys = true;
        return false;
      } else {
        return field !== opts?.permissionField;
      }
    }).forEach((field) => {
      const relationField = relationFieldsByModel[model][field];
      if (relationField) {
        const nestedCreationTree = creationTree && field in creationTree.children ? creationTree.children[field] : void 0;
        const res = filterQueryResults(entry[field], mask?.[field], nestedCreationTree, abilities, relationField.type, operation, opts);
        entry[field] = res;
      }
      if (operation !== "groupBy" && (!permittedFields.includes(field) && !relationField) || mask?.[field] === true) {
        delete entry[field];
      } else if (relationField) {
        hasKeys = true;
      } else {
        hasKeys = true;
      }
    });
    return hasKeys && Object.keys(entry).length > 0 ? entry : null;
  };
  const permissionResult = storePermissions(result, abilities, model, opts);
  if (Array.isArray(permissionResult)) {
    return permissionResult.map((entry) => filterPermittedFields(entry)).filter((x) => x);
  } else {
    return filterPermittedFields(permissionResult);
  }
}

// src/index.ts
function useCaslAbilities(getAbilityFactory, opts) {
  const txMaxWait = opts?.txMaxWait ?? 3e4;
  const txTimeout = opts?.txTimeout ?? 3e4;
  return Prisma.defineExtension((client) => {
    let tickActive = false;
    const batches = {};
    function extendCaslAbilities(extendFactory) {
      const extendedClient = client.$extends({
        query: {
          $allModels: {
            ...allOperations(() => extendFactory(getAbilityFactory()))
          }
        }
      });
      const ctx = Prisma.getExtensionContext(this);
      const scopeCtx = ctx[/* @__PURE__ */ Symbol.for("prisma.client.transaction.scope_context")];
      if (scopeCtx?.kind === "nested") {
        const transactionClient = extendedClient._createItxClient(
          { kind: "itx", id: scopeCtx.txId },
          scopeCtx.scopeId,
          scopeCtx.scopeState
        );
        transactionClient.$casl = extendCaslAbilities;
        transactionClient.$transaction = async (first) => {
          return first(transactionClient);
        };
        return transactionClient;
      }
      extendedClient.$casl = extendCaslAbilities;
      return extendedClient;
    }
    const allOperations = (getAbilities) => ({
      async $allOperations({ args, query, model, operation, ...rest }) {
        const { fluentModel, fluentRelationModel, fluentRelationField } = getFluentModel(model, rest);
        const __internalParams = rest.__internalParams;
        const transaction = __internalParams.transaction;
        const debug = (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") && args.debugCasl;
        const debugAllErrors = args.debugCasl;
        delete args.debugCasl;
        const perf = debug ? performance : void 0;
        const logger = debug ? console : void 0;
        perf?.clearMeasures("prisma-casl-extension-Overall");
        perf?.clearMeasures("prisma-casl-extension-Create Abilities");
        perf?.clearMeasures("prisma-casl-extension-Create Casl Query");
        perf?.clearMeasures("prisma-casl-extension-Finish Query");
        perf?.clearMeasures("prisma-casl-extension-Filtering Results");
        perf?.clearMarks("prisma-casl-extension-0");
        perf?.clearMarks("prisma-casl-extension-1");
        perf?.clearMarks("prisma-casl-extension-2");
        perf?.clearMarks("prisma-casl-extension-3");
        perf?.clearMarks("prisma-casl-extension-4");
        if (!(operation in caslOperationDict)) {
          return query(args);
        }
        perf?.mark("prisma-casl-extension-0");
        const abilities = transaction?.abilities ?? getAbilities().build();
        if (transaction) {
          transaction.abilities = abilities;
        }
        perf?.mark("prisma-casl-extension-1");
        function getCaslQuery() {
          try {
            return applyCaslToQuery(operation, args, abilities, model, opts?.permissionField ? true : false);
          } catch (e) {
            if (debugAllErrors || caslOperationDict[operation].action !== "read") {
              throw e;
            }
          }
        }
        const caslQuery = getCaslQuery();
        if (fluentRelationField?.isList && !caslQuery?.args.select[fluentRelationField.name]) {
          return [];
        }
        if (!caslQuery) {
          if (operation === "findMany") {
            return [];
          } else {
            return null;
          }
        }
        perf?.mark("prisma-casl-extension-2");
        logger?.log("Query Args", JSON.stringify(caslQuery.args));
        logger?.log("Query Mask", JSON.stringify(caslQuery.mask));
        const cleanupResults = (result) => {
          perf?.mark("prisma-casl-extension-3");
          if (fluentRelationModel && caslQuery.mask) {
            caslQuery.mask = fluentRelationModel && fluentRelationModel in caslQuery.mask ? caslQuery.mask[fluentRelationModel] : {};
          }
          const filteredResult = filterQueryResults(result, caslQuery.mask, caslQuery.creationTree, abilities, fluentModel, operation, opts);
          if (perf) {
            perf.mark("prisma-casl-extension-4");
            logger?.log(
              [
                perf.measure("prisma-casl-extension-Overall", "prisma-casl-extension-0", "prisma-casl-extension-4"),
                perf.measure("prisma-casl-extension-Create Abilities", "prisma-casl-extension-0", "prisma-casl-extension-1"),
                perf.measure("prisma-casl-extension-Create Casl Query", "prisma-casl-extension-1", "prisma-casl-extension-2"),
                perf.measure("prisma-casl-extension-Finish Query", "prisma-casl-extension-2", "prisma-casl-extension-3"),
                perf.measure("prisma-casl-extension-Filtering Results", "prisma-casl-extension-3", "prisma-casl-extension-4")
              ].map((measure) => {
                return `${measure.name.replace("prisma-casl-extension-", "")}: ${measure.duration}`;
              })
            );
          }
          return filteredResult;
        };
        const operationAbility = caslOperationDict[operation];
        if (transaction && transaction.kind === "batch") {
          throw new Error("Sequential transactions are not supported in prisma-extension-casl.");
        }
        const hash = transaction?.id ?? "batch";
        if (!batches[hash]) {
          batches[hash] = [];
        }
        if (!tickActive) {
          tickActive = true;
          process.nextTick(() => {
            dispatchBatches(transaction);
            tickActive = false;
          });
        }
        const batchQuery = (model2, action, args2, callback) => new Promise((resolve, reject) => {
          batches[hash].push({
            params: __internalParams,
            model: model2,
            action,
            args: args2,
            reject,
            resolve,
            callback
          });
        });
        if (operationAbility.action === "update" || operationAbility.action === "create" || operation === "deleteMany") {
          const op = operation === "createMany" ? "createManyAndReturn" : operation === "updateMany" ? "updateManyAndReturn" : operation;
          return batchQuery(model, op, caslQuery.args, async (result) => {
            const filteredResult = cleanupResults(result);
            const results = operation === "createMany" || operation === "deleteMany" || operation === "updateMany" ? { count: result.length } : filteredResult;
            return results;
          });
        } else {
          return batchQuery(model, operation, caslQuery.args, async (result) => {
            const fluentField = getFluentField(rest);
            if (fluentField) {
              return cleanupResults(result?.[fluentField]);
            }
            return cleanupResults(result);
          });
        }
      }
    });
    client._requestHandler.dataloader.options.batchBy = (request) => {
      const batchId = getBatchId(request.protocolQuery);
      if (request.transaction?.id) {
        return `transaction-${request.transaction.id}${batchId ? `-${batchId}` : ""}`;
      }
      return batchId;
    };
    const dispatchBatches = (transaction) => {
      for (const [key, batch] of Object.entries(batches)) {
        delete batches[key];
        const runBatchTransaction = async (tx) => {
          if (opts?.beforeQuery) {
            await opts.beforeQuery(tx);
          }
          const results = await Promise.all(
            batch.map((request) => {
              return tx[request.model][request.action](request.args).then((res) => request.callback(res)).catch((e) => {
                throw e;
              });
            })
          );
          if (opts?.afterQuery) {
            await opts?.afterQuery(tx);
          }
          return results;
        };
        new Promise((resolve, reject) => {
          if (transaction && transaction.kind === "itx") {
            const scopeId = globalThis.crypto?.randomUUID() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            runBatchTransaction(client._createItxClient(transaction, scopeId, { stack: [] })).then(resolve).catch(reject);
          } else {
            client.$transaction(async (tx) => {
              return runBatchTransaction(tx);
            }, {
              maxWait: txMaxWait,
              timeout: txTimeout
            }).then(resolve).catch(reject);
          }
        }).then((results) => {
          results.forEach((result, index) => {
            batch[index].resolve(result);
          });
        }).catch((e) => {
          for (const request of batch) {
            request.reject(e);
          }
          delete batches[key];
        });
      }
    };
    return client.$extends(createCaslExtension()).$extends({
      name: "prisma-extension-casl",
      client: {
        $casl: extendCaslAbilities
      },
      query: {
        $allModels: {
          ...allOperations(getAbilityFactory)
        }
      }
    });
  });
}
function getBatchId(query) {
  if (query.action !== "findUnique" && query.action !== "findUniqueOrThrow") {
    return void 0;
  }
  const parts = [];
  if (query.modelName) {
    parts.push(query.modelName);
  }
  if (query.query.arguments) {
    parts.push(buildKeysString(query.query.arguments));
  }
  parts.push(buildKeysString(query.query.selection));
  return parts.join("");
}
function buildKeysString(obj) {
  const keysArray = Object.keys(obj).sort().map((key) => {
    const value = obj[key];
    if (typeof value === "object" && value !== null) {
      return `(${key} ${buildKeysString(value)})`;
    }
    return key;
  });
  return `(${keysArray.join(" ")})`;
}
export {
  applyCaslToQuery,
  getBatchId,
  useCaslAbilities
};
