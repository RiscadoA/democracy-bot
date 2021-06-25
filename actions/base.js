class Base {
  constructor(type) {
    this.type = type;
  }

  revert() { return true; }
  apply() { return true; }
}

module.exports = Base;