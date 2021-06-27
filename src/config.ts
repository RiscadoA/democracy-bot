import { Guild } from "discord.js";
import Constants from "./constants";

export type ActionConfig = {
  needsVote: boolean;     // Is a vote required?
  voteDuration?: number;  // Vote duration in hours
  yesRatio?: number;      // Required Yes ratio
  earlyVotes?: number;    // Minimum vote count to accept early
  lateVotes?: number;     // Minimum vote count to accept late
};

export default abstract class Config {
  static actions: Record<string, ActionConfig> = Constants.DEFAULT_ACTION_CONFIG;
}
