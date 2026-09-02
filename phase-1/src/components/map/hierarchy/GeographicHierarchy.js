/**
 * GeographicHierarchy Utilities
 * Provides hierarchy-aware traversals and relationships without hardcoding levels.
 */
export class GeographicHierarchy {
  constructor(registry) {
    this.registry = registry;
  }

  getAncestors(region) {
    const ancestors = [];
    let current = region;
    while (current && current.parentId) {
      const parent = this.registry.get(current.parentId);
      if (parent) {
        ancestors.push(parent);
        current = parent;
      } else {
        break;
      }
    }
    return ancestors;
  }

  getChildren(region) {
    if (!region || !region.children) return [];
    return region.children;
  }

  getSiblings(region) {
    if (!region || !region.parentId) return [];
    const parent = this.registry.get(region.parentId);
    if (!parent) return [];
    return parent.children.filter((child) => child.id !== region.id);
  }

  getDescendants(region) {
    const descendants = [];
    const traverse = (node) => {
      if (!node || !node.children) return;
      for (const child of node.children) {
        descendants.push(child);
        traverse(child);
      }
    };
    traverse(region);
    return descendants;
  }

  isAncestorOf(ancestor, candidate) {
    if (!ancestor || !candidate) return false;
    const ancestors = this.getAncestors(candidate);
    return ancestors.some((a) => a.id === ancestor.id);
  }

  isDescendantOf(descendant, candidate) {
    if (!descendant || !candidate) return false;
    return this.isAncestorOf(candidate, descendant);
  }
}
