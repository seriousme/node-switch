class Trie {
  constructor() {
    this.value = [];
    this.children = new Map();
  }

  _matchChild(child, parts) {
    const childNode = this.children.get(child);
    return childNode ? childNode.match(parts) : [];
  }

  match(parts) {
    if (parts.length === 0) {
      return this.value ? this.value : [];
    }
    const [first, ...rest] = parts;
    const exact = this._matchChild(first, rest);
    const single = this._matchChild("+", rest);
    const subtree = this._matchChild("#", []);
    const results = exact.concat(single, subtree);
    return results;
  }

  add(parts, value) {
    if (parts.length === 0) {
      this.value = this.value.concat(value);
      return;
    }
    const [first, ...rest] = parts;
    const child = this.children.get(first);
    if (child instanceof Trie) {
      child.add(rest, value);
    } else {
      const node = new Trie();
      this.children.set(first, node);
      node.add(rest, value);
    }
    return;
  }

  remove(parts, value) {
    // console.log("removing", parts, value);
    if (parts.length === 0) {
      const arr = this.value || [];
      this.value = arr.filter((item) => item !== value);
      //console.log(this.value);
      return;
    }
    const [first, ...rest] = parts;
    const node = this.children.get(first);
    if (node) {
      node.remove(rest, value);
      if (node.value === 0 && this.children.size === 0) {
        console.log("removing", first);
        this.children.delete(first);
      }
    }
  }
}

module.exports = Trie;
