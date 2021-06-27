import * as Discord from "discord.js"
import COMMANDS_ from "./commands";
import { ActionConfig } from "./config";

export default abstract class Constants {
  static readonly DEBUG = true;

  static readonly GUILD_NAME = "Democracy Guild";

  static readonly PARTIAL_ROLE_IDS: Record<string, number> = {
    "everyone": 0,
    "Bootstrap": 1,
    "Admin": 2,
    "Citizen": 3,
  };

  static readonly PARTIAL_CATEGORY_IDS: Record<string, number> = {
    "meta": 0,
    "main": 1,
    "vc": 2,
    "admin": 3,
    "archive": 4,
    "bot": 5,
  };

  // Roles given to the first member
  static readonly SETUP_ROLES: string[] = [
    "Bootstrap", // Necessary for completing the setup of the server
    "Admin",
    "Citizen",
  ];

  // Role permissions
  static readonly ROLE_PERMS: Record<string, Discord.PermissionString[]> = {
    "Bootstrap": [
      "ADMINISTRATOR"
    ],
    "Admin": [
      "MANAGE_MESSAGES",
      "MANAGE_EMOJIS",
      "MANAGE_NICKNAMES",
    ],
    "Citizen": []
  };

  // Permission overwrites for categories
  static readonly PARTIAL_CATEGORY_PERMS: Record<string, Discord.PartialOverwriteData[]> = {
    "meta": [
      {
        id: Constants.PARTIAL_ROLE_IDS["everyone"],
        type: "role",
        deny: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
      },
    ],
    "main": [],
    "vc": [],
    "admin": [
      {
        "id": Constants.PARTIAL_ROLE_IDS["everyone"],
        "type": "role",
        "deny": ["VIEW_CHANNEL"],
      },
      {
        "id": Constants.PARTIAL_ROLE_IDS["Admin"],
        "type": "role",
        "allow": ["VIEW_CHANNEL"],
      },
    ],
    "archive": [
      {
        "id": Constants.PARTIAL_ROLE_IDS["everyone"],
        "type": "role",
        "deny": ["SEND_MESSAGES"],
      },
    ],
    "bot": [
      {
        "id": Constants.PARTIAL_ROLE_IDS["everyone"],
        "type": "role",
        "deny": ["VIEW_CHANNEL"],
      }
    ]
  };

  // Permission overwrites for text channels.
  static readonly PARTIAL_CHANNEL_PERMS: Record<string, Record<string, Discord.PartialOverwriteData[]>> = {
    "meta": {
      "events": [
        {
          id: Constants.PARTIAL_ROLE_IDS["Admin"],
          type: "role",
          allow: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
        },
      ],
    },
    "main": {},
    "vc": {},
    "admin": {},
    "archive": {},
    "bot": {}
  };

  // Channel structure (categories and text channels)
  static readonly CHANNEL_STRUCTURE: Record<string, string[]> = {
    "meta": [
      "info",
      "democracy",
      "events",
    ],
    "main": [],
    "vc": [],
    "admin": [
      "general",
    ],
    "archive": [],
    "bot": [
      "log",
    ]
  }

  static readonly DEFAULT_ACTION_CONFIG: Record<string, ActionConfig> = {
    "set.action": {
      needsVote: true,
      voteDuration: 48,
      yesRatio: 70,
      earlyVotes: 20,
      lateVotes: 10,
    },
    "set.name": {
      needsVote: false,
    },
    "set.icon": {
      needsVote: false,
    },
    "create.role": {
      needsVote: false,
    },
    "create.text": {
      needsVote: false,
    },
    "delete.role": {
      needsVote: false,
    },
    "delete.text": {
      needsVote: true,
      voteDuration: 12,
      yesRatio: 50,
      earlyVotes: 10,
      lateVotes: 5,
    },
    "give.role": {
      needsVote: false,
    },
    "give.role.citizen": {
      needsVote: false,
    },
    "take.role": {
      needsVote: false,
    },
    "take.role.citizen": {
      needsVote: true,
      voteDuration: 12,
      yesRatio: 50,
      earlyVotes: 10,
      lateVotes: 5,
    },
    "kick": {
      needsVote: false,
    },
    "kick.citizen": {
      needsVote: true,
      voteDuration: 12,
      yesRatio: 50,
      earlyVotes: 10,
      lateVotes: 5,
    },
  };

  // Message shown when setting up the guild
  static readonly SETUP_MSG: string =
    "Hi! To finish the setup you must give the permission 'application.commands' to the bot. "    +
    "This can be done by going to the OAuth2 section in the bot application page and "            +
    "generating a OAuth2 URL with the correct permission. So that you can authorize the bot, "    +
    "you received a temporary Administrator permission which will be removed when another "       +
    "user joins the server. Before that happens, you must finish the bot setup.";
  
  static readonly SETUP_FAILED_MSG: string =
    "Couldn't setup the server, have you followed the instructions of the previous message? "     +
    "To retry, make everyone leave the server and rejoin it."

  static readonly COMMANDS = COMMANDS_;
}
