import { Guild } from "discord.js";

export abstract class Base {
  abstract type: string;
  abstract needs_vote: boolean;
  abstract loggable: boolean;
  abstract revert(guild: Guild): Promise<boolean>;
  abstract apply(guild: Guild): Promise<void>;
}

