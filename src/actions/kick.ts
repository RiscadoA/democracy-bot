import { Guild, GuildMember } from "discord.js";
import { Base } from './base'

export class Kick extends Base {
  type: string = "kick";
  needs_vote: boolean = false;
  member: GuildMember;

  constructor(member: GuildMember) {
    super();
    this.member = member;
    if (this.member.roles.cache.find(r => r.name == "Citizen")) {
      this.needs_vote = true;
    }
  }

  async revert(guild: Guild) {
    return false;
  }

  async apply(guild: Guild) {
    await this.member.kick().catch();
  }
}
