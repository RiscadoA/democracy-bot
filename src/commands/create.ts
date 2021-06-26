import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import Constants from "../constants";
import * as Actions from "../actions";

export default class Create implements Base {
  clearance: Clearance = "admin";

  data = {
    name: "create",
    description: "Create a role, or a text or voice channel",
    options: [
      {
        name: "role",
        type: 1, // SUB_COMMAND
        description: 'Create a role',
        options: [
          {
            name: "name",
            type: 3, // STRING
            description: "The name of the new role",
            required: true,
          },
          {
            name: "color",
            type: 3, // STRING
            description: "The color of the new role",
            required: false,
          }
        ]
      },
    ],
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction) {
    const guild = interaction.guild;
    const role_options = interaction.options.get("role").options;
    
    // create role
    if (role_options) {
        const name = role_options.get("name").value as string;
        const color = role_options.get("color")?.value as string;

        if (Object.keys(Constants.PARTIAL_ROLE_IDS)[name]) {
          interaction.reply({ content: "Reserved role name", ephemeral: true });
          return null;
        }
        else if (guild.roles.cache.find(r => r.name == name)) {
          interaction.reply({ content: "Duplicate role name", ephemeral: true });
          return null;
        }

        if (color && !/^#[0-9A-F]{6}$/.test(color)) {
          interaction.reply({ content: "Invalid color, must be hex coded (FFFFFF for example)", ephemeral: true });
          return null;
        }

        return new Actions.CreateRole({
          color: color,
          name: name,
        });
    }
    // create text
    // TODO
    // create voice
    // TODO

    return null;
  };
}