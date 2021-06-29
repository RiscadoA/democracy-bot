import { Guild } from "discord.js";
import { Base } from './base'

export class SetName extends Base {
  static readonly BASE_TYPE: string = "set.name";
  static readonly EXTRA_TYPES: string[] = [];
  type: string = SetName.BASE_TYPE;

  prev: string;
  next: string;

  constructor(prev: string, next: string) {
    super();
    this.prev = prev;
    this.next = next;
  }

  async revert(guild: Guild) {
    await guild.setName(this.prev);
    return true;
  }

  async apply(guild: Guild) {
    await guild.setName(this.next);
  }

  what() {
    return `Change guild name to ${this.next}`;
  }
}
