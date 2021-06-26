// What does the builder do?
// Check state of the guild and repair it if necessary
// If no guild was found a new one is created

import * as Discord from 'discord.js';
import { stringify } from 'querystring';
import Constants from './constants';

export async function buildGuild(client: Discord.Client): Promise<Discord.Guild> {
  let guild = client.guilds.cache.first();

  if (guild) {
    await repairGuild(guild);
  }
  else {
    guild = await createGuild(client);
  }

  return guild;
}

async function createGuild(client: Discord.Client): Promise<Discord.Guild> {
  let options: Discord.GuildCreateOptions = {};
  
  // Get role data from Constants
  options.roles = Object.keys(Constants.PARTIAL_ROLE_IDS).map(name => {
    const id = Constants.PARTIAL_ROLE_IDS[name];
    const permissions = Constants.ROLE_PERMS[name];
    return { id: id, name: name, permissions: permissions };
  });

  // Get category data from Constants
  const categories: Discord.PartialChannelData[] = Object.keys(Constants.PARTIAL_CATEGORY_IDS).map(name => {
    const id = Constants.PARTIAL_CATEGORY_IDS[name];
    const permissions = Constants.PARTIAL_CATEGORY_PERMS[name];
    return { type: "category", id: id, name: name, permissionOverwrites: permissions };
  });

  // Get channel data from Constants
  const text_channels: Discord.PartialChannelData[] = [].concat(...Object.keys(Constants.CHANNEL_STRUCTURE).map(cat => {
    return Constants.CHANNEL_STRUCTURE[cat].map(ch => {
      const parentID = Constants.PARTIAL_CATEGORY_IDS[cat];
      const permissions = Constants.PARTIAL_CHANNEL_PERMS[cat][ch];
      return { type: "text", parentID: parentID, name: ch, permissionOverwrites: permissions };
    })
  }));

  // Merge categories and text channels
  options.channels = categories.concat(text_channels);

  // Create guild
  const guild = await client.guilds.create(Constants.GUILD_NAME, options);
  const info_channel = guild.channels.cache.find(channel => channel.name == "info") as Discord.TextChannel;
  const invite = await info_channel.createInvite({ maxAge: 0, unique: true, reason: "First invite." });
  console.log(`Democracy Guild created. Invite code: ${invite.url}`)
  info_channel.send(Constants.SETUP_MSG);
  return guild;
}

async function repairGuild(guild: Discord.Guild) {
  await guild.delete();
}

export async function setupGuild(guild: Discord.Guild, member: Discord.GuildMember) {
  let setup_roles = await Promise.all(Constants.SETUP_ROLES.map(async name => {
    let role = guild.roles.cache.find(r => r.name === name);
    if (!role) {
      role = await guild.roles.create({ name: name, permissions: Constants.ROLE_PERMS[name] })
    }
    return role;
  }));
  
  await member.roles.add(setup_roles);
}

export async function startGuild(guild: Discord.Guild) {
  let bootstrap_role = guild.roles.cache.find(r => r.name === "Bootstrap");
  if (!bootstrap_role) // Server already started
    return;
  bootstrap_role.delete();
}
