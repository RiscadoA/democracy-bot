import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import Constants from "../constants";
import * as Actions from "../actions";

export default class Take implements Base {
  clearance: Clearance = "admin";

  data = {
    name: "take",
    description: "Takes a role from a user",
    options: [
      {
        name: "role",
        type: 1, // SUB_COMMAND
        description: 'Takes a role from a user',
        options: [
          {
            name: "role",
            type: 8, // ROLE
            description: "The name of the role",
            required: true,
          },
          {
            name: "user",
            type: 6, // USER
            description: "The user which will lose the role",
            required: true,
          },
        ]
      },
    ],
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction) {
    const guild = interaction.guild;
    const role_options = interaction.options.get("role").options;
    
    // give role
    if (role_options) {
      const role = role_options.get("role").role;
      const user = role_options.get("user").user;
      const member = await guild.members.fetch(user);

      if (!role) {
        await interaction.editReply("Role not found");
        return null;
      }
      else if (!member) {
        await interaction.editReply("User not found");
        return null;
      }
      else if (role.name !== "Citizen" && Constants.PARTIAL_ROLE_IDS[role.name]) {
        await interaction.editReply("Reserved role, can't be taken");
        return null;
      }
      else if (!member.roles.cache.find(r => r.id === role.id)) {
        await interaction.editReply("User doesn't have that role");
        return null;
      }

      const action = new Actions.TakeRole(role.name, user.id);
      if (role.name === "Citizen") {
        action.needsVote = true;
      }
      return action;
    }

    return null;
  };
}