// What does the builder do?
// Check state of the guild and repair it if necessary
// If no guild was found a new one is created

import * as Discord from 'discord.js';
import Constants from './constants';

function fromPartialOverwrites(guild: Discord.Guild, partial: Discord.PartialOverwriteData): Discord.OverwriteResolvable {
  const name = Object.keys(Constants.PARTIAL_ROLE_IDS).find(v => Constants.PARTIAL_ROLE_IDS[v] === partial.id);
  
  let id;
  if (name == "everyone") {
    id = guild.roles.everyone.id;
  }
  else {
    id = guild.roles.cache.find(r => r.name == name).id;
  }
  
  return {
    id: id,
    type: partial.type,
    allow: partial.allow,
    deny: partial.deny,
  }
}

export async function buildGuild(client: Discord.Client): Promise<Discord.Guild> {
  let guild = client.guilds.cache.first();

  if (guild) {
    await repairGuild(guild);
  }
  else {
    guild = await createGuild(client);
  }

  console.log("Guild built");
  return guild;
}

async function createGuild(client: Discord.Client): Promise<Discord.Guild> {
  let options: Discord.GuildCreateOptions = {};
  
  const guild = await client.guilds.create(Constants.GUILD_NAME);

  // Nuke guild
  await guild.channels.cache.forEach(async channel => {
    await channel.delete();
  });

  // Repairing an empty guild rebuilds it
  await repairGuild(guild);

  // Create invite
  const info_channel = guild.channels.cache.find(channel => channel.name == "info") as Discord.TextChannel;
  const invite = await info_channel.createInvite({ maxAge: 0, unique: true, reason: "First invite." });
  console.log(`Democracy Guild created. Invite code: ${invite.url}`)
  return guild;
}

export async function repairGuild(guild: Discord.Guild) {
  // Check roles, create necessary roles
  for (let name of Object.keys(Constants.PARTIAL_ROLE_IDS)) {
    const permissions = Constants.ROLE_PERMS[name];
    if (permissions) {
      const role = guild.roles.cache.find(r => r.name == name);

      if (name === "everyone") {
        await guild.roles.everyone.setPermissions(permissions);
      }
      else if (role) {
        role.setPermissions(permissions);
      }
      else if (name !== "Bootstrap" || guild.memberCount <= 2) {
        await guild.roles.create({ name: name, permissions: permissions });
      }
    }
  }

  // Check categories
  for (let catN of Object.keys(Constants.CHANNEL_STRUCTURE)) {
    const permissions = Constants.PARTIAL_CATEGORY_PERMS[catN].map(p => {
      return fromPartialOverwrites(guild, p);  
    });

    let cat = guild.channels.cache.find(c => c.name === catN && c.type === "category");
    if (cat) {
      await cat.overwritePermissions(permissions);
    }
    else {
      cat = await guild.channels.create(catN, {
        type: "category",
        permissionOverwrites: permissions
      });
    }

    // Check text channels
    for (let chN of Constants.CHANNEL_STRUCTURE[catN]) {
      let ch = await guild.channels.cache.find(c => c.name === chN && c.parent === cat && c.type == "text");
      if (!ch) {
        ch = await guild.channels.create(chN, {
          type: "text",
          parent: cat
        });
      } 

      // Update permissions
      await ch.lockPermissions();
      await Constants.PARTIAL_CHANNEL_PERMS[catN][chN]?.map(p => {
        return fromPartialOverwrites(guild, p);  
      }).forEach(async p => {
        const role = guild.roles.cache.find(r => r.id === p.id);
        const allow = (new Discord.Permissions(p.allow)).toArray();
        const deny = (new Discord.Permissions(p.deny)).toArray();
        const perms = Object.assign({}, ...allow.map(x => ({[x]: true })).concat(deny.map(x => ({[x]: false }))));

        await ch.updateOverwrite(role, perms);
      });
    }
  }

  // TODO: Also repair channel ordering
}

export async function setupGuild(guild: Discord.Guild, member: Discord.GuildMember) {
  // Give setup roles to member
  let setup_roles = await Promise.all(Constants.SETUP_ROLES.map(async name => {
    let role = guild.roles.cache.find(r => r.name === name);
    if (!role) {
      role = await guild.roles.create({ name: name, permissions: Constants.ROLE_PERMS[name] })
    }
    return role;
  }));

  // Send setup message
  const bootstrap_role = guild.roles.cache.find(r => r.name === "Bootstrap");
  const info_channel = guild.channels.cache.find(channel => channel.name == "info") as Discord.TextChannel;
  await info_channel.bulkDelete(100); // Clear channel
  info_channel.send("<@&" + bootstrap_role.id + "> " + Constants.SETUP_MSG);

  await member.roles.add(setup_roles);
}

export async function startGuild(guild: Discord.Guild) {
  const bootstrap_role = guild.roles.cache.find(r => r.name === "Bootstrap");
  if (!bootstrap_role) // Server already started
    return;

  const info_channel = guild.channels.cache.find(channel => channel.name == "info") as Discord.TextChannel;
  await info_channel.bulkDelete(100); // Clear channel

  // Activate commands
  await updateGuildCommands(guild).catch(reason => {
    info_channel.send("<@&" + bootstrap_role.id + "> " + Constants.SETUP_FAILED_MSG);
    console.log(reason);
  });

  // Remove bootstrap role so every member that has it loses it.
  bootstrap_role.delete();  
}

export async function updateGuildCommands(guild: Discord.Guild) {
  const admin_role = guild.roles.cache.find(r => r.name === "Admin");
  const citizen_role = guild.roles.cache.find(r => r.name === "Citizen");
  
  return guild.commands.set(Constants.COMMANDS.map(cmd => cmd.data)).then(() => {
    Constants.COMMANDS.forEach(cmd => {
      let perms: Discord.ApplicationCommandPermissionData[];
      
      switch (cmd.clearance) {
        case "admin":
          perms = [
            {
              id: admin_role.id,
              type: "ROLE",
              permission: true,
            }
          ]
          break;

        case "citizen":
          perms = [
            {
              id: citizen_role.id,
              type: "ROLE",
              permission: true,
            }
          ]
          break;

        case "none":
          perms = [
            {
              id: guild.roles.everyone.id,
              type: "ROLE",
              permission: true,
            }
          ]
          break;
      }

      const id = guild.commands.cache.find(c => c.name == cmd.data.name);
      guild.commands.setPermissions(id, perms);
    });
  });
}