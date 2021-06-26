import * as Discord from "discord.js";
import Base from "./base";
import Constants from "../constants";

export default class Kick implements Base {
  data: {
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
    if (member.user) {
      const content = member.user.username + ' was kicked!';
      await member.kick();
      await interaction.reply({ content: content, ephemeral: true });
    }
    else {
      await interaction.reply({ content: "Couldn't kick member, cast to Discord.GuildMember failed", ephemeral: true })
    }
  };
}