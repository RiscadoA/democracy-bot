import { Client } from "discord.js";
import { Base } from './base'

export class EditGuild extends Base {
  // prev, next = { name: "<guild-name>", icon: "<icon-url>"}
  constructor(prev, next) {
    super("edit_guild");
  }

  revert(client: Client) {
    const guild = client.guilds.cache
  }

  apply(client: Client) {
    
  }
}
