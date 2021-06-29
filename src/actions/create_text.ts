import { GuildChannelCreateOptions, Guild, TextChannel } from "discord.js";
import { Base } from './base'
import { archiveStore } from "../archive";

export class CreateText extends Base {
  static readonly BASE_TYPE: string = "create.text";
  static readonly EXTRA_TYPES: string[] = [];
  type: string = CreateText.BASE_TYPE;
  
  name: string;
  roleName?: string;

  constructor(name: string, roleName?: string) {
    super();
    this.name = name;
    this.roleName = roleName;
  }

  async revert(guild: Guild) {
    const channel = await guild.channels.cache.find(ch => ch.name === this.name && ch.type === "text") as TextChannel;
    await archiveStore(guild, channel)
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
    return `Create text channel ${this.name}`;
  }
}
