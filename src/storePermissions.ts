import { AbilityTuple, PureAbility } from "@casl/ability";
import { PrismaQuery } from "@casl/prisma";
import { getSubject } from "./helpers";

export function storePermissions(result: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: string, prop?: string) {
  if (prop === undefined) {
    return result
  }
  const actions = ['create', 'read', 'update', 'delete'] as const
  const storeProp = (entry: any) => {
    if (entry) {
      entry[prop] = []
      actions.forEach((action) => {
        if (abilities.can(action, getSubject(model, entry))) {
          entry[prop].push(action)
        }
      })
    }
    return entry
  }
  if (Array.isArray(result)) {
    const res = result.map(storeProp)
    return res
  } else {
    return storeProp(result)
  }
}