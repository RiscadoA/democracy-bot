import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import Constants from "../constants";
import * as Actions from "../actions";

export default class Restore implements Base {
  clearance: Clearance = "admin";

  data = {
    name: "restore",
    description: "Restores a text channel",
    options: [
      {
        name: "text",
        type: 1, // SUB_COMMAND
        description: 'Restore a text channel',
        options: [
          {
            name: "name",
            type: 3, // STRING
            description: "The name of the text channel",
            required: true,
          }
        ]
      },
      {
        name: "text",
        type: 1, // SUB_COMMAND
        description: 'Create a text channel',
        options: [
          {
            name: "name",
            type: 3, // STRING
            description: "The name of the new text channel",
            required: true,
          },
          {
            name: "role",
            type: 8, // ROLE
            description: "If sent, makes the channel private to this role",
            required: false,
          }
        ]
      },
      {
        name: "voice",
        type: 1, // SUB_COMMAND
        description: 'Create a voice channel',
        options: [
          {
            name: "name",
            type: 3, // STRING
            description: "The name of the new text channel",
            required: true,
          },
          {
            name: "role",
            type: 8, // ROLE
            description: "If sent, makes the channel private to this role",
            required: false,
          }
        ]
      },
    ],
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction) {
    const guild = interaction.guild;
    const role_options = interaction.options.get("role")?.options;
    const text_options = interaction.options.get("text")?.options;
    const voice_options = interaction.options.get("voice")?.options;
    
    // create role
    if (role_options) {
      const name = role_options.get("name").value as string;
      const color = role_options.get("color")?.value as string;

      if (Constants.PARTIAL_ROLE_IDS[name]) {
        await interaction.editReply("Reserved role name");
        return null;
      }
      else if (guild.roles.cache.find(r => r.name == name)) {
        await interaction.editReply("Duplicate role name");
        return null;
      }

      if (color && !/^[0-9A-F]{6}$/.test(color)) {
        await interaction.editReply("Invalid color, must be hex coded (FFFFFF for example)");
        return null;
      }

      return new Actions.CreateRole({
        color: color,
        name: name,
      });
    }
    // create text
    else if (text_options) {
      let name = text_options.get("name").value as string;
      const role = text_options.get("role")?.role;

      // Process name
      name = name.toLowerCase().replace(/ /g, '-');
      if (guild.channels.cache.find(ch => ch.name == name && ch.type == "text")) {
        await interaction.editReply("Duplicate channel name");
        return null;
      }
      
      return new Actions.CreateText(name, role?.name);
    }
    // create voice
    else if (voice_options) {
      let name = voice_options.get("name").value as string;
      const role = voice_options.get("role")?.role;

      // Process name
      name = name.toLowerCase().replace(/ /g, '-');
      if (guild.channels.cache.find(ch => ch.name == name && ch.type == "voice")) {
        await interaction.editReply("Duplicate channel name");
        return null;
      }
      
      return new Actions.CreateVoice(name, role?.name);
    }

    return null;
  };
}
