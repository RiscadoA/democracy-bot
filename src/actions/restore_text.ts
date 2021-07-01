import { Guild, TextChannel, Snowflake } from "discord.js";
import { Base } from './base'
import { archiveLoad, archiveStore } from "../archive";

export class RestoreText extends Base {
  static readonly BASE_TYPE: string = "restore.text";
  type: string = RestoreText.BASE_TYPE;
  
  id: Snowflake;

  constructor(id: Snowflake) {
    super();
    this.id = id;
  }

  async revert(guild: Guild) {
    await archiveStore(guild, await guild.channels.fetch(this.id) as TextChannel);
    return true;
  }

  async apply(guild: Guild) {
    await archiveLoad(guild, this.id);
  }

  what() {
    return `Restore text channel <#${this.id}>`;
  }
}
