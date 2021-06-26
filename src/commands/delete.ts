import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import Constants from "../constants";
import * as Actions from "../actions";

export default class Delete implements Base {
  clearance: Clearance = "admin";

  data = {
    name: "delete",
    description: "Delete a role, or a text or voice channel",
    options: [
      {
        name: "role",
        type: 1, // SUB_COMMAND
        description: 'Delete a role',
        options: [
          {
            name: "name",
            type: 3, // STRING
            description: "The name of the role to be deleted",
            required: true,
          }
        ]
      },
    ],
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction) {
    const guild = interaction.guild;
    const role_options = interaction.options.get("role").options;
    
    // delete role
    if (role_options) {
      const name = role_options.get("name").value as string;
      const role = guild.roles.cache.find(r => r.name == name);

      if (Object.keys(Constants.PARTIAL_ROLE_IDS)[name]) {
        interaction.reply({ content: "Reserved role, can't be deleted", ephemeral: true });
        return null;
      }
      else if (!role) {
        interaction.reply({ content: "Role not found", ephemeral: true });
        return null;
      }

      return new Actions.DeleteRole({
        color: role.color,
        name: name,
      });
    }
    // delete text
    // TODO
    // delete voice
    // TODO

    return null;
  };
}