import { Guild, TextChannel } from "discord.js";
import { Base } from './base'
import { Edit } from "./edit";

export async function logAction(guild: Guild, action: Base) {
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category");
  const log = guild.channels.cache.find(ch => ch.name === "log" && ch.isText() && ch.parent === bot) as TextChannel;
  const json = JSON.stringify(action);
  await log.send({
    content: json,
    code: "json"
  });
}

export async function logUndo(guild: Guild): Promise<Base> {
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category");
  const log = guild.channels.cache.find(ch => ch.name === "log" && ch.isText() && ch.parent === bot) as TextChannel;
  let action: Base = null;

  do {
    const msgL = await log.messages.fetch({ limit: 1 });
    const msg = msgL?.first();

    if (!msg) {
      break;
    }

    if (!msg.content.includes('```json')) {
      await msg.delete();
      continue;
    }

    const json = msg.content.slice(7, msg.content.length - 4);
    await msg.delete();
    action = JSON.parse(json) as Base;
    switch (action.type) {
      case "edit":
        let d = action as Edit
        action = new Edit(d.prev, d.next); 
        break;
    }

    // Only stop when an action that is revertable is found
  } while (!(await action.revert(guild)));
  
  return action;
}
