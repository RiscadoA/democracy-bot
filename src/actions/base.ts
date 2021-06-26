import { Client } from "discord.js";

export class Base {
  type: string;

  constructor(type: string) {
    this.type = type;
  }

  revert(client: Client) {}
  apply(client: Client) {}
}

