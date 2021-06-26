import * as Discord from "discord.js";
import Base from "./base";
import Constants from "../constants";
import { logUndo } from "../actions";

export default class Undo implements Base {
  data = {
    name: 'undo',
    description: 'Undoes a previous action',
  };

  async callback(interaction: Discord.CommandInteraction) {
    const action = await logUndo(interaction.guild);
    if (action) {
      await interaction.reply({ content: `Undid action of type ${action.type}`, ephemeral: true });
    }
    else {
      await interaction.reply({ content: 'No action to undo', ephemeral: true });
    }
    return null;
  };
}