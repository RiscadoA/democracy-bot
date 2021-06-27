import { GuildChannelCreateOptions, Guild } from "discord.js";
import { Base } from './base'

export class CreateText extends Base {
  type: string = "create_text";
  needsVote: boolean = false;
  
  name: string;
  roleName?: string;

  constructor(name: string, roleName?: string) {
    super();
    this.name = name;
    this.roleName = roleName;
  }

  async revert(guild: Guild) {
    // TODO: Send channel to archive instead of deleting it
    await guild.channels.cache.find(ch => ch.name === this.name && ch.type === "text")?.delete();
    return true;
  }

  async apply(guild: Guild) {
    const mainCat = guild.channels.cache.find(ch => ch.type === "category" && ch.name === "main");
    const adminRole = guild.roles.cache.find(r => r.name === "Admin");
    const role = guild.roles.cache.find(r => r.name === this.roleName);

    let options: GuildChannelCreateOptions = {
      parent: mainCat,
      type: "text",
    };

    if (role) {
      options.permissionOverwrites = [
        {
          id: guild.roles.everyone.id,
          deny: "VIEW_CHANNEL"
        },
        {
          id: role.id,
          allow: "VIEW_CHANNEL"
        },
        {
          id: adminRole.id,
          allow: "VIEW_CHANNEL"
        }
      ];
    }

    await guild.channels.create(this.name, options);
  }

  what() {
    return `Created text channel ${this.name}`;
  }
}