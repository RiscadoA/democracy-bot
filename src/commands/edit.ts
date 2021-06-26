import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import Constants from "../constants";
import * as Actions from "../actions";

export default class Edit implements Base {
  clearance: Clearance = "admin";

  data = {
    name: 'edit',
    description: 'Edits a property of the guild',
    options: [
      {
        name: "what",
        type: 3, // STRING
        description: 'What will be edited',
        required: true,
        choices: [
          {
            name: "Guild name",
            value: "name",
          },
          {
            name: "Guild icon",
            value: "icon",
          },
        ]
      },
      {
        name: "value",
        type: 3, // STRING
        description: 'New value',
        required: true,
      }
    ],
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction): Promise<Actions.Edit> {
    const guild = interaction.guild;
    const what = interaction.options.get('what').value as string;
    const value = interaction.options.get('value').value as string;

    switch (what) {
      case "name":
        return new Actions.Edit(
          { name: guild.name, icon: guild.iconURL() },
          { name: value, icon: guild.iconURL() }
        );
      case "icon":
        return new Actions.Edit(
          { name: guild.name, icon: guild.iconURL() },
          { name: guild.name, icon: value }
        );
    }

    return null;
  };
}