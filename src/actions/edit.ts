import { Guild } from "discord.js";
import { Base } from './base'

export type EditState = {
  name: string;
  icon: string;
}

export class Edit extends Base {
  static readonly BASE_TYPE: string = "edit";
  type: string = Edit.BASE_TYPE;

  prev: EditState;
  next: EditState;

  constructor(prev: EditState, next: EditState) {
    super();
    this.prev = prev;
    this.next = next;
  }

  async revert(guild: Guild) {
    if (this.prev.name !== this.next.name) {
      await guild.setName(this.prev.name);
    }
    if (this.prev.icon !== this.next.icon) {
      await guild.setIcon(this.prev.icon).catch(err => {
        console.log("Couldn't set new icon");
      });
    }

    return true;
  }

  async apply(guild: Guild) {
    if (this.prev.name !== this.next.name) {
      await guild.setName(this.next.name);
    }
    if (this.prev.icon !== this.next.icon) {
      await guild.setIcon(this.next.icon).catch(err => {
        console.log("Couldn't set new icon");
      });
    }
  }

  what() {
    if (this.prev.name !== this.next.name) {
      return `Changed guild name to ${this.next.name}`;
    }
    else {
      return `Changed guild icon to ${this.next.icon}`;
    }
  }
}
