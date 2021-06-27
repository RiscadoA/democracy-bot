import { SpawnOptionsWithStdioTuple } from "child_process";
import { Guild, GuildMember, Snowflake } from "discord.js";
import { Base } from './base'

export class Kick extends Base {
  type: string = "kick";
  needsVote: boolean = false;
  
  user: Snowflake;

  constructor(user: Snowflake) {
    super();
    this.user = user;
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
