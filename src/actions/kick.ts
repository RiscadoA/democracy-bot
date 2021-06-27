import { SpawnOptionsWithStdioTuple } from "child_process";
import { Guild, GuildMember, Snowflake } from "discord.js";
import { Base } from './base'

export class Kick extends Base {
  static readonly BASE_TYPE: string = "kick";
  type: string = Kick.BASE_TYPE;
  
  user: Snowflake;

  constructor(guild: Guild, member: GuildMember) {
    super();
    this.user = member.id;
    if (member.roles.cache.find(r => r.name === "Citizen")) {
      this.type = "kick.citizen";
    }
  }

  async revert(guild: Guild) {
    return false;
  }

  async apply(guild: Guild) {
    const member = await guild.members.fetch(this.user);
    if (member && member.kickable) {
      await member.kick();
    }
  }

  what() {
    return `Kicked user <@&${this.user}>`;
  }
}
