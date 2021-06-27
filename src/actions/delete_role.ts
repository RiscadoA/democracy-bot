import { CreateRoleOptions, Guild, Snowflake } from "discord.js";
import { Base } from './base'

export class DeleteRole extends Base {
  static readonly BASE_TYPE: string = "delete.role";
  type: string = DeleteRole.BASE_TYPE;

  roleOptions: CreateRoleOptions;
  users: Snowflake[];

  constructor(roleOptions: CreateRoleOptions, users: Snowflake[]) {
    super();
    this.roleOptions = roleOptions;
    this.users = users;
  }

  async revert(guild: Guild) {
    const role = await guild.roles.create(this.roleOptions);
    await this.users.forEach(async id => {
      const member = await guild.members.fetch(id);
      if (member) {
        member.roles.add(role);
      }
    });
    return true;
  }

  async apply(guild: Guild) {
    await guild.roles.cache.find(role => role.name == this.roleOptions.name)?.delete();
  }

  what() {
    return `Deleted role ${this.roleOptions.name}`;
  }
}
