import { Guild, Message } from "discord.js";
import * as Actions from '.';

export function getAllTypes(): string[] {
  return Object.keys(Actions)
    .filter(key => key !== "Base" && Actions[key].prototype && Actions[key].BASE_TYPE)
    .map(key => [Actions[key].BASE_TYPE, ...(Actions[key].EXTRA_TYPES ? Actions[key].EXTRA_TYPES.map(t => Actions[key].BASE_TYPE + "." + t) : [])])
    .reduce((prev: string[], cur: string[]) =>[].concat(...prev, ...cur));
}

export abstract class Base {
  abstract type: string;

  abstract revert(guild: Guild): Promise<boolean>;
  abstract apply(guild: Guild): Promise<void>;
  abstract what();
}

export function updatePrototype(action: Base): Base {
  let success = false;

  // Crazy reflection to set the prototype of the action
  Object.keys(Actions).forEach(key => {
    if (!success && key !== "Base" && Actions[key].prototype) {
      if (Actions[key].BASE_TYPE && action.type.startsWith(Actions[key].BASE_TYPE)) {
        Object.setPrototypeOf(action, Actions[key].prototype);
        success = true;
      }
    }
  });

  if (!success) {
    action = null;
  }

  return action;
}

export function fromString(data: string): Base {
  const action = JSON.parse(data) as Base;
  return updatePrototype(action);
}

export function fromMessage(msg: Message): Base {
  const json = msg.content.slice(7, msg.content.length - 4);
  return fromString(json);
}