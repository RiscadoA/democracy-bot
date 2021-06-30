import { Guild } from "discord.js";
import { Base } from './base'
import Config, { ActionConfig } from "../config";

export class SetAction extends Base {
  static readonly BASE_TYPE: string = "set.action";
  static readonly EXTRA_TYPES: string[] = [];
  type: string = SetAction.BASE_TYPE;

  name: string;
  prev: ActionConfig;
  next: ActionConfig;

  constructor(name: string, prev: ActionConfig, next: ActionConfig) {
    super();
    this.name = name;
    this.prev = prev;
    this.next = next;
  }

  async revert(guild: Guild) {
    await Config.setAction(this.name, this.prev);
    return true;
  }

  async apply(guild: Guild) {
    await Config.setAction(this.name, this.next);
  }

  what() {
    return `Change action ${this.name} configuration to ${JSON.stringify(this.next)}`; // TODO: Make this pretty
  }
}
