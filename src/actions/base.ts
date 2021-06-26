import { Guild } from "discord.js";

export abstract class Base {
  abstract needs_vote: boolean;
  abstract revert(guild: Guild): Promise<void>;
  abstract apply(guild: Guild): Promise<void>;
}

