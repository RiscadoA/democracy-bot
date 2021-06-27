import { CreateRoleOptions, Guild } from "discord.js";
import { Base } from './base'

export class DeleteRole extends Base {
  type: string = "delete_role";
  needs_vote: boolean = false;
  loggable: boolean = true;
  roleOptions: CreateRoleOptions;

  constructor(roleOptions: CreateRoleOptions) {
    super();
    this.roleOptions = roleOptions;
  }

  async revert(guild: Guild) {
    await guild.roles.create(this.roleOptions).catch(console.error);
    return true;
  }

  async apply(guild: Guild) {
    await guild.roles.cache.find(role => role.name == this.roleOptions.name)?.delete();
  }
}
