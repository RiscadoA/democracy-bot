import { Guild, Message } from "discord.js";
import * as Actions from '.';

export abstract class Base {
  abstract type: string;

  abstract revert(guild: Guild): Promise<boolean>;
  abstract apply(guild: Guild): Promise<void>;
  abstract what();
}

export function updatePrototype(action: Base): Base {
  // Crazy reflection to set the prototype of the action
  Object.keys(Actions).forEach(key => {
    if (key !== "Base" && Actions[key].prototype) {
      if (Actions[key].BASE_TYPE && action.type === Actions[key].BASE_TYPE) {
        Object.setPrototypeOf(action, Actions[key].prototype);
        return action;
      }
    }
  });

  return null;
}

export function fromString(data: string): Base {
  const action = JSON.parse(data) as Base;
  return updatePrototype(action);
}

export function fromMessage(msg: Message): Base {
  const json = msg.content.slice(7, msg.content.length - 4);
  return fromString(json);
}