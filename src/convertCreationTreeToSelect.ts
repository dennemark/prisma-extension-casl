
export type CreationTree = { type: string, children: Record<string, CreationTree> }

export function convertCreationTreeToSelect(relationQuery: CreationTree): Record<string, any> | true | null {

  // Base case: if there are no children and type is 'create', keep this node
  if (Object.keys(relationQuery.children).length === 0) {
    return relationQuery.type === 'create' ? {} : null;
  }

  // Recursively filter children
  const relationResult: Record<string, any> = {};

  for (const key in relationQuery.children) {

    const childRelation = convertCreationTreeToSelect(relationQuery.children[key]);

    // If the filtered child is valid, add it to the filtered children
    if (childRelation !== null) {
      // we use select here, so that the query is compatible with getRuleRelationsQuery
      relationResult[key] = { select: childRelation };
    }
  }
  // After filtering children, check if there are any valid children left
  // or if this node itself is a valid 'create' node
  return Object.keys(relationResult).length > 0 ? relationResult : relationQuery.type === 'create' ? {} : null

}