Base = require('./base.js')

class EditGuild extends Base {
  // prev, next = { name: "<guild-name>", icon: "<icon-url>"}
  constructor(prev, next) {
    super("edit_guild");
  }

  revert() {
    
  }

  apply() {
    
  }
}

module.exports = EditGuild;