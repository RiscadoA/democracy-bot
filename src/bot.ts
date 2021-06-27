require('dotenv').config()

import * as Discord from "discord.js";
import * as Actions from "./actions";
import Constants from "./constants";
import { buildGuild, setupGuild, startGuild } from "./guild";

const client = new Discord.Client({ intents: Discord.Intents.ALL });

// ================================ Callbacks =================================

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.on('ready', async () => {
  console.log('Democracy bot online!');
  await buildGuild(client);
});

client.on('guildMemberAdd', async member => {
  const guild = member.guild;

  if (guild.memberCount <= 2) {
    await setupGuild(guild, member);
  }
  else {
    await startGuild(guild);
  }
});

client.on('interaction', async interaction => {
  if (!interaction.isCommand()) return;

  const guild = interaction.guild;
  const cmd = Constants.COMMANDS.find(cmd => cmd.data.name === interaction.commandName);
  if (!cmd) {
    return;
  }

  interaction.defer({ ephemeral: true });
  let action = await cmd.callback(interaction);
  if (action) {
    try {
      await action.apply(interaction.guild);
    }
    catch (err) {
      await interaction.editReply("Couldn't apply action");
      action = null;
    }

    if (action) {
      await interaction.editReply("Applied action successfully");
      await Actions.logAction(guild, action);
    }
  }
});

client.login(process.env.BOT_TOKEN)
