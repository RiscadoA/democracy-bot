import { Guild, Snowflake } from "discord.js";
import { Base } from './base'

export class GiveRole extends Base {
  static readonly BASE_TYPE: string = "give.role";
  static readonly EXTRA_TYPES: string[] = [];
  type: string = GiveRole.BASE_TYPE;

  roleName: string;
  user: Snowflake;

  constructor(roleName: string, user: Snowflake) {
    super();
    this.roleName = roleName;
    this.user = user;
  }

  async revert(guild: Guild) {
    const member = await guild.members.fetch(this.user);
    const role = await guild.roles.cache.find(r => r.name == this.roleName);
    if (member && role) {
      await member.roles.remove(role);
    }
    return true;
  }

  async apply(guild: Guild) {
    const member = await guild.members.fetch(this.user);
    const role = await guild.roles.cache.find(r => r.name == this.roleName);
    if (member && role) {
      await member.roles.add(role);
    }
  }

  what() {
    return `Give role ${this.roleName} to user <@${this.user}>`;
  }
}
