import * as Discord from "discord.js";
import Base from "./base";
import Constants from "../constants";
import { repairGuild } from "../guild";

export default class Reload implements Base {
  data = {
    name: 'reload',
    description: 'Reloads a bot module',
    options: [{
      name: "what",
      type: 3, // STRING
      description: 'What will be reloaded',
      required: true,
      choices: [
        {
          name: "Commands",
          value: "commands",
        },
        {
          name: "Guild",
          value: "guild",
        },
      ]
    }],
  };

  async callback(interaction: Discord.CommandInteraction) {
    const guild = interaction.guild;

    switch (interaction.options.get("what").value as string) {
      case "commands":
        await guild.commands.set(Constants.COMMANDS.map(cmd => cmd.data)).catch(async reason => {
          console.log(reason);
          await interaction.reply({ content: "Couldn't reload commands, error sent to console", ephemeral: true })
        });
        break;
      case "guild":
        await repairGuild(guild);
        break;
    }

    await interaction.reply({ content: 'Done', ephemeral: true });
    return null;
  };
}