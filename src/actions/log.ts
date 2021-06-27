import { Guild, TextChannel } from "discord.js";

import * as Actions from '.'

export async function logAction(guild: Guild, action: Actions.Base) {
  const admin = guild.channels.cache.find(ch => ch.name === "admin" && ch.type === "category");
  const log = guild.channels.cache.find(ch => ch.name === "log" && ch.isText() && ch.parent === admin) as TextChannel;
  const json = JSON.stringify(action);
  await log.send({
    content: json,
    code: "json"
  });
}

export async function logUndo(guild: Guild): Promise<Actions.Base> {
  const admin = guild.channels.cache.find(ch => ch.name === "admin" && ch.type === "category");
  const log = guild.channels.cache.find(ch => ch.name === "log" && ch.isText() && ch.parent === admin) as TextChannel;

  let action: Actions.Base;

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

    action = Actions.fromMessage(msg);
    await msg.delete();
    // Only stop when an action that is revertable is found
  } while (!(action && await action.revert(guild)));

  return action;
}
