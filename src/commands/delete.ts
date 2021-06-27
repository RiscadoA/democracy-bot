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
            type: 8, // ROLE
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
      const role = role_options.get("name").role;

      if (Constants.PARTIAL_ROLE_IDS[role.name]) {
        await interaction.editReply("Reserved role, can't be deleted");
        return null;
      }
      else if (!role) {
        await interaction.editReply("Role not found");
        return null;
      }

      return new Actions.DeleteRole({
        color: role.color,
        name: role.name,
      }, guild.roles.cache.find(r => r.id == role.id).members.map(member => member.user.id));
    }
    // delete text
    // TODO
    // delete voice
    // TODO

    return null;
  };
}