import * as Discord from "discord.js";
import Base from "./base";
import Constants from "../constants";

export default class Reload implements Base {
  data: {
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
          name: "All",
          value: "all",
        },
      ]
    }],
  };

  async callback(interaction: Discord.CommandInteraction) {
    const guild = interaction.guild;

    switch (interaction.options.get("what").value as string) {
      case "all":
      case "commands":
        await guild.commands.set(Constants.COMMANDS.map((cmd: Base) => cmd.data));
        break;
    }

    await interaction.reply({ content: 'Done', ephemeral: true });
  };
}