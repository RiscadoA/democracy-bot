import { CategoryChannel, Guild, GuildTextChannelResolvable, NewsChannel, Snowflake, TextChannel } from "discord.js";
import Constants from "./constants";

export async function archiveStore(guild: Guild, channel: TextChannel) {
  const archive = guild.channels.cache.find(ch => ch.name === "archive" && ch.type === "category") as CategoryChannel;
  const adminRole = guild.roles.cache.find(r => r.name === "Admin");
  
  // Get new index for the channel
  const index = 1 + Math.max(0, ...(await archiveQuery(guild, channel.name))
    .map(x => x.name.match(/\d+$/))
    .filter(x => x)
    .map(x => parseInt(x[0])));

  // Get roles of channel
  let roles = await Promise.all(channel.permissionOverwrites
    .filter(p => p.id !== guild.roles.everyone.id && p.id != adminRole.id)
    .map(async p => (await guild.roles.fetch(p.id))?.name));
  roles = roles.filter(r => r); // Remove undefined 

  await channel.setName(channel.name + "-" + index.toString())
  await channel.setParent(archive, { lockPermissions: true });
  await channel.send({
    content: JSON.stringify(roles),
    code: "json",
  });
}

export async function archiveLoad(guild: Guild, id: Snowflake) {
  const archive = guild.channels.cache.find(ch => ch.name === "archive" && ch.type === "category") as CategoryChannel;
  const main = guild.channels.cache.find(ch => ch.name === "main" && ch.type === "category") as CategoryChannel;
  const adminRole = guild.roles.cache.find(r => r.name === "Admin");

  const channel = archive.children.find(ch => ch.id === id) as TextChannel;

  const msg = (await channel.messages.fetch({ limit: 1 }))?.first();
  const json = msg.content.slice(7, msg.content.length - 4);
  const overwrites = JSON.parse(json)
    .map(roleName => guild.roles.cache.find(r => r.name === roleName))
    .filter(r => r)
    .map(r => ({
      id: r.id,
      allow: "VIEW_CHANNEL",
    }));

  // Set parent and permissions
  if (overwrites.length > 0) {
    await channel.setParent(main, { lockPermissions: false });
    await channel.overwritePermissions([].concat(
      ...[
        {
          id: guild.roles.everyone.id,
          deny: "VIEW_CHANNEL"
        },
        {
          id: adminRole.id,
          allow: "VIEW_CHANNEL"
        },
      ],
      ...overwrites
    ));
  }
  else {
    await channel.setParent(main, { lockPermissions: true });
  }

  // Set name
  await channel.setName(channel.name.substr(0, channel.name.search(/-\d+$/)));
}

// Returns the possible channels that can be restored, with the date of deletion
// Since channels are stored as <original name>-<number>
async function archiveQuery(guild: Guild, name: string): Promise<{name: string, date: string}[]> {
  const archive = guild.channels.cache.find(ch => ch.name === "archive" && ch.type === "category") as CategoryChannel;
  let query = [];

  for (let channel of archive.children.values()) {
    if (channel.isText() && (new RegExp("^" + name + "-\\d+$")).test(channel.name)) {
      const msg = (await channel.messages.fetch({ limit: 1 }))?.first();
      if (msg) {
        query.push({
          name: channel.name,
          date: msg.createdAt.toString()
        });
      }
    }
  }
  
  return query;
}
