import { AbilityTuple, PureAbility } from '@casl/ability';
import { rulesToAST } from '@casl/ability/extra';
import { PrismaQuery } from '@casl/prisma';
import { Prisma } from '@prisma/client';
import { getRuleRelationsQuery } from './getRuleRelationsQuery';

export type CreationTree<M extends Prisma.ModelName = Prisma.ModelName> = {
  action: string,
  model: Prisma.ModelName,
  children: Record<string, CreationTree>,
  /**
   * mutation query for creation / update
   * with fields that are modified on mutation
   * and the where query
   * 
   * we use the where query to see which entries have been modified
   * and the check accessibleBy per field
   * to see if mutations are forbidden
   */
  mutation: { fields: string[], where: any }[]
}

export function convertCreationTreeToSelect<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, abilities: PureAbility<AbilityTuple, PrismaQuery>, relationQuery: CreationTree<M>): Record<string, any> | true | null {
  // Recursively filter children
  let relationResult: Record<string, any> = {};
  if (relationQuery.action === 'create') {
    const ast = rulesToAST(abilities, relationQuery.action, relationQuery.model)
    relationResult = getRuleRelationsQuery<T, M>(prismaInstance, relationQuery.model, ast, {})
  }

  // Base case: if there are no children and type is 'create', keep this node
  if (Object.keys(relationQuery.children).length === 0) {
    return relationQuery.action === 'create' ? relationResult : null;
  }



  for (const key in relationQuery.children) {

    const childRelation = convertCreationTreeToSelect<T, M>(prismaInstance, abilities, relationQuery.children[key]);

    // If the filtered child is valid, add it to the filtered children
    if (childRelation !== null) {
      // we use select here, so that the query is compatible with getRuleRelationsQuery
      relationResult[key] = { select: childRelation };
    }
  }
  // After filtering children, check if there are any valid children left
  // or if this node itself is a valid 'create' node
  return Object.keys(relationResult).length > 0 ? relationResult : relationQuery.action === 'create' ? {} : null

}