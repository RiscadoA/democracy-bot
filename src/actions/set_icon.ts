import { Guild } from "discord.js";
import { Base } from './base'

export class SetIcon extends Base {
  static readonly BASE_TYPE: string = "set.icon";
  static readonly EXTRA_TYPES: string[] = [];
  type: string = SetIcon.BASE_TYPE;

  prev: string;
  next: string;

  constructor(prev: string, next: string) {
    super();
    this.prev = prev;
    this.next = next;
  }

  async revert(guild: Guild) {
    await guild.setIcon(this.prev).catch(err => {
      console.log("Couldn't set new icon");
    });
    return true;
  }

  async apply(guild: Guild) {
    await guild.setIcon(this.next).catch(err => {
      console.log("Couldn't set new icon");
    });
  }

  what() {
    return `Change guild icon to ${this.next}`;
  }
}
