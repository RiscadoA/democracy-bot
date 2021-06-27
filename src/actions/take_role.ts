import { Guild, GuildMember, Snowflake } from "discord.js";
import { Base } from './base'

export class TakeRole extends Base {
  static readonly BASE_TYPE: string = "take.role";
  type: string = TakeRole.BASE_TYPE;

  roleName: string;
  user: Snowflake;

  constructor(roleName: string, user: Snowflake) {
    super();
    this.roleName = roleName;
    this.user = user;
    if (roleName === "Citizen") {
      this.type = "take.role.citizen";
    }
  }

  async revert(guild: Guild) {
    const member = await guild.members.fetch(this.user);
    const role = await guild.roles.cache.find(r => r.name == this.roleName);
    if (member && role) {
      member.roles.add(role);
    }
    return true;
  }

  async apply(guild: Guild) {
    const member = await guild.members.fetch(this.user);
    const role = await guild.roles.cache.find(r => r.name == this.roleName);
    if (member && role) {
      member.roles.remove(role);
    }
  }

  what() {
    return `Take role ${this.roleName} from user <@${this.user}>`;
  }
}
