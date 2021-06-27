import { GuildChannelCreateOptions, Guild, PermissionOverwrites } from "discord.js";
import { Base } from './base'

export class DeleteText extends Base {
  type: string = "delete_text";
  needsVote: boolean = false;
  
  name: string;
  roles: string[];

  constructor(name: string, roles: string[]) {
    super();
    this.name = name;
    this.roles = roles;
  }

  async revert(guild: Guild) {
    // TODO: Bring channel from archive instead of deleting it
    const mainCat = guild.channels.cache.find(ch => ch.type === "category" && ch.name === "main");
    const adminRole = guild.roles.cache.find(r => r.name === "Admin");
    const overwrites = this.roles
      .map(roleName => guild.roles.cache.find(r => r.name === roleName))
      .filter(r => r)
      .map(r => ({
        id: r.id,
        allow: "VIEW_CHANNEL",
      }));

    let options: GuildChannelCreateOptions = {
      parent: mainCat,
      type: "text",
    };

    // Set permissions
    if (overwrites.length > 0) {
      options.permissionOverwrites = [].concat(
        ...[
          {
            id: guild.roles.everyone.id,
            deny: "VIEW_CHANNEL"
          },
          {
            id: adminRole.id,
            allow: "VIEW_CHANNEL"
          },
        ],
        ...overwrites
      );
    }

    await guild.channels.create(this.name, options);
    return true;
  }

  async apply(guild: Guild) {
    // TODO: Send channel to archive instead of deleting it
    await guild.channels.cache.find(ch => ch.name === this.name && ch.type === "text")?.delete();
  }

  what() {
    return `Created text channel ${this.name}`;
  }
}
