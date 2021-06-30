import { GuildChannelCreateOptions, Guild, TextChannel } from "discord.js";
import { Base } from './base'
import { archiveStore } from "../archive";

export class CreateVoice extends Base {
  static readonly BASE_TYPE: string = "create.voice";
  static readonly EXTRA_TYPES: string[] = [];
  type: string = CreateVoice.BASE_TYPE;

  name: string;
  roleName?: string;

  constructor(name: string, roleName?: string) {
    super();
    this.name = name;
    this.roleName = roleName;
  }

  async revert(guild: Guild) {
    const channel = await guild.channels.cache.find(ch => ch.name === this.name && ch.type === "voice") as VoiceChannel;
    await archiveStore(guild, channel)
    return true;
  }

  async apply(guild: Guild) {
    const mainCat = guild.channels.cache.find(ch => ch.type === "category" && ch.name === "vc");
    const adminRole = guild.roles.cache.find(r => r.name === "Admin");
    const role = guild.roles.cache.find(r => r.name === this.roleName);

    let options: GuildChannelCreateOptions = {
      parent: mainCat,
      type: "voice",
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
    return `Create voice channel ${this.name}`;
  }
}
