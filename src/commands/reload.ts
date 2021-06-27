import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import Constants from "../constants";
import { repairGuild, updateGuildCommands } from "../guild";

export default class Reload implements Base {
  clearance: Clearance = "admin";
  
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
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction) {
    const guild = interaction.guild;

    switch (interaction.options.get("what").value as string) {
      case "commands":
        try {
          await updateGuildCommands(guild);
        }
        catch (reason) {
          console.log(reason);
          await interaction.editReply("Couldn't reload commands, error sent to console");
        }
        break;
      case "guild":
        await repairGuild(guild);
        break;
    }

    await interaction.editReply("Done");
    return null;
  };
}