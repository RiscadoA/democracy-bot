import { Guild, Snowflake, TextChannel } from "discord.js";
import { Base } from './base'
import { archiveLoad, archiveStore } from "../archive";

export class DeleteText extends Base {
  static readonly BASE_TYPE: string = "delete.text";
  type: string = DeleteText.BASE_TYPE;
  
  id: Snowflake;

  constructor(id: Snowflake) {
    super();
    this.id = id;
  }

  async revert(guild: Guild) {
    await archiveLoad(guild, this.id);
    return true;
  }

  async apply(guild: Guild) {
    await archiveStore(guild, await guild.channels.fetch(this.id) as TextChannel);
  }

  what() {
    return `Deleted text channel <#${this.id}>`;
  }
}
