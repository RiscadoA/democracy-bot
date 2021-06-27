import { Base, Guild, TextChannel } from "discord.js";

import * as Actions from '.'

export async function logAction(guild: Guild, action: Actions.Base) {
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category");
  const log = guild.channels.cache.find(ch => ch.name === "log" && ch.isText() && ch.parent === bot) as TextChannel;
  const json = JSON.stringify(action);
  await log.send({
    content: json,
    code: "json"
  });
}

export async function logUndo(guild: Guild): Promise<Actions.Base> {
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category");
  const log = guild.channels.cache.find(ch => ch.name === "log" && ch.isText() && ch.parent === bot) as TextChannel;

  let action: Actions.Base;
  let success: boolean;

  do {
    success = false;

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
    action = JSON.parse(json) as Actions.Base;
    await msg.delete();

    // Crazy reflection to set the prototype of the action
    Object.keys(Actions).forEach(key => {
      if (key !== "Base" && Actions[key].prototype) {
        if (Actions[key].BASE_TYPE && action.type === Actions[key].BASE_TYPE) {
          Object.setPrototypeOf(action, Actions[key].prototype);
          success = true;
        }
      }
    })

    // Only stop when an action that is revertable is found
  } while (!(success && await action.revert(guild)));
  
  if (!success) {
    return null;
  }

  return action;
}
