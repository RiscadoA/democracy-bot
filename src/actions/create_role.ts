import { CreateRoleOptions, Guild } from "discord.js";
import { Base } from './base'

export class CreateRole extends Base {
  static readonly BASE_TYPE: string = "create.role";
  static readonly EXTRA_TYPES: string[] = [];
  type: string = CreateRole.BASE_TYPE;
  
  roleOptions: CreateRoleOptions;

  constructor(roleOptions: CreateRoleOptions) {
    super();
    this.roleOptions = roleOptions;
  }

  async revert(guild: Guild) {
    await guild.roles.cache.find(role => role.name == this.roleOptions.name)?.delete();
    return true;
  }

  async apply(guild: Guild) {
    await guild.roles.create(this.roleOptions).catch(console.error);
  }

  what() {
    return `Create role ${this.roleOptions.name}`;
  }
}
