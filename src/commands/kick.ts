import * as Discord from "discord.js";
import Base from "./base";
import * as Actions from "../actions";

export default class Kick implements Base {
  data = {
    name: 'kick',
    description: 'Kicks a member',
    options: [{
      name: 'member',
      type: 6, // USER
      description: 'The member to kick',
      required: true,
    }],
  };

  async callback(interaction: Discord.CommandInteraction) {
    const member = interaction.options.get('member').member as Discord.GuildMember;
    return new Actions.Kick(member);
  };
}