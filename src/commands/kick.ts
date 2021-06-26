import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import * as Actions from "../actions";

export default class Kick implements Base {
  clearance: Clearance = "admin";

  data = {
    name: 'kick',
    description: 'Kicks a member',
    options: [{
      name: 'member',
      type: 6, // USER
      description: 'The member to kick',
      required: true,
    }],
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction) {
    const member = interaction.options.get('member').member as Discord.GuildMember;
    return new Actions.Kick(member);
  };
}