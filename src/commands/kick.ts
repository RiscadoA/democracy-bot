import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import * as Actions from "../actions";

export default class Kick implements Base {
  clearance: Clearance = "admin";

  data = {
    name: 'kick',
    description: 'Kicks a user',
    options: [{
      name: 'user',
      type: 6, // USER
      description: 'The user to kick',
      required: true,
    }],
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction) {
    const member = interaction.options.get('user').member as Discord.GuildMember;
    let action = new Actions.Kick(interaction.guild, member);
    return action; 
  };
}