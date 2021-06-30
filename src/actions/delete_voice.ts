import { GuildChannelCreateOptions, Guild } from "discord.js";
import { Base } from './base'

export class DeleteVoice extends Base {
  static readonly BASE_TYPE: string = "delete.voice";
  static readonly EXTRA_TYPES: string[] = [];
  type: string = DeleteVoice.BASE_TYPE;
  
  name: string;
  roles: string[];

  constructor(name: string, roles: string[]) {
    super();
    this.name = name;
    this.roles = roles;
  }

  async revert(guild: Guild) {
    const mainCat = guild.channels.cache.find(ch => ch.type === "category" && ch.name === "vc");
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
      type: "voice",
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
    await guild.channels.cache.find(ch => ch.name === this.name && ch.type === "voice")?.delete();
  }

  what() {
    return `Delete text channel ${this.name}`;
  }
}
