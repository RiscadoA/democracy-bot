import * as Discord from "discord.js";
import Base, { Clearance } from "./base";
import * as Actions from "../actions";
import Config from "../config";
import deepEqual from "deep-equal";

export default class Set implements Base {
  clearance: Clearance = "admin";

  data = {
    name: "set",
    description: "Sets a property of the guild",
    options: [
      {
        name: "name",
        type: 1, // SUB_COMMAND
        description: "Sets the name of the guild",
        options: [
          {
            name: "name",
            type: 3, // STRING
            description: "The new name of the guild",
            required: true,
          },
        ]
      },
      {
        name: "icon",
        type: 1, // SUB_COMMAND
        description: "Sets the icon of the guild",
        options: [
          {
            name: "url",
            type: 3, // STRING
            description: "The new icon of the guild",
            required: true,
          },
        ]
      },
      {
        name: "action",
        type: 1, // SUB_COMMAND
        description: "Sets properties of an action",
        options: [
          {
            name: "action",
            type: 3, // STRING
            description: "The action to edit",
            choices: Actions.getAllTypes().map(t => ({ name: t, value: t })),
            required: true,
          },
          {
            name: "needs-vote",
            type: 5, // BOOLEAN
            description: "Does the action need to be voted?",
            required: true,
          },
          {
            name: "vote-duration",
            type: 4, // INTEGER
            description: "How long should the vote take in hours",
            required: false,
          },
          {
            name: "yes-ratio",
            type: 4, // INTEGER
            description: "The required ratio of 'yes' to be accepted (in %)",
            required: false,
          },
          {
            name: "early-votes",
            type: 4, // INTEGER
            description: "The required number of 'yes' for the vote to be accepted before the due time",
            required: false,
          },
          {
            name: "late-votes",
            type: 4, // INTEGER
            description: "The required number of answers for the vote to terminate after the due time",
            required: false,
          },
        ]
      },
    ],
    defaultPermission: false,
  };

  async callback(interaction: Discord.CommandInteraction) {
    const guild = interaction.guild;
    const nameOptions = interaction.options.get("name")?.options;
    const iconOptions = interaction.options.get("icon")?.options;
    const actionOptions = interaction.options.get("action")?.options;

    // set name
    if (nameOptions) {
      const name = nameOptions.get("name").value as string;
      return new Actions.SetName(guild.name, name);
    }
    // set icon
    else if (iconOptions) {
      const url = nameOptions.get("url").value as string;
      return new Actions.SetIcon(guild.iconURL(), url);
    }
    // set action
    else if (actionOptions) {
      const action = actionOptions.get("action")?.value as string;
      const needsVote = actionOptions.get("needs-vote")?.value as boolean;
      const voteDuration = actionOptions.get("vote-duration")?.value as number;
      let yesRatio = actionOptions.get("yes-ratio")?.value as number;
      const earlyVotes = actionOptions.get("early-votes")?.value as number;
      const lateVotes = actionOptions.get("late-votes")?.value as number;

      if (yesRatio)
        yesRatio /= 100;

      const prev = Config.actions.get(action);
      const next = {
        needsVote: needsVote,
        voteDuration: voteDuration,
        yesRatio: yesRatio,
        earlyVotes: earlyVotes,
        lateVotes: lateVotes
      };

      if (deepEqual(prev, next)) {
        interaction.reply("Nothing happened because there was no change")
        return null;
      }

      return new Actions.SetAction(action, prev, next);
    }

    return null;
  };
}
