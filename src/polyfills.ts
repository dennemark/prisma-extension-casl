if (!Set.prototype.isSubsetOf) {
  Set.prototype.isSubsetOf = function (set) {
    for (let elem of this) {
      if (!set.has(elem)) {
        return false;
      }
    }
    return true;
  };
}
if (!Set.prototype.isDisjointFrom) {
  Set.prototype.isDisjointFrom = function (set) {
    for (let elem of this) {
      if (set.has(elem)) {
        return false;
      }
    }
    return true;
  };
}