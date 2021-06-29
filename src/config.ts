import { CategoryChannel, Guild, Snowflake, TextChannel } from "discord.js";
import Constants from "./constants";

import deepEqual from "deep-equal";

export type ActionConfig = {
  needsVote: boolean;     // Is a vote required?
  voteDuration?: number;  // Vote duration in hours
  yesRatio?: number;      // Required Yes ratio
  earlyVotes?: number;    // Minimum vote count to accept early
  lateVotes?: number;     // Minimum vote count to accept late
};

type ConfigEntry = {msg: Snowflake, name: string} & ( 
  ({type: "action"} & ActionConfig) // Add other entry types here, eg: | ({type: "<type>"} & <EntryType>)
);

export default abstract class Config {
  static actions: Map<string, ActionConfig> = new Map;

  static async fetchEntries(guild: Guild) {
    const admin = guild.channels.cache.find(ch => ch.name === "admin" && ch.type === "category") as CategoryChannel;
    const config = guild.channels.cache.find(ch => ch.name === "config" && ch.parent == admin && ch.type === "text") as TextChannel;

    // Search for configuration entries
    const msgs = await config.messages.fetch({ limit: 100 });
    return msgs
      .map((msg, id) => ({c: msg.content, id: id}))
      .filter(d => d.c.startsWith('```json'))
      .map(d => ({e: JSON.parse(d.c.slice(7, d.c.length - 4)) as ConfigEntry[], id: d.id}))
      .map(d => d.e.map(e => { let x = e; x.msg = d.id; return x; }))
      .reduce((prev, cur) => prev.concat(cur), []);
  }

  static async load(guild: Guild) {
    const entries = await Config.fetchEntries(guild);

    // Set default config and overwrite it with loaded entries
    Config.actions = new Map(Object.entries(Constants.DEFAULT_ACTION_CONFIG));
    entries.forEach(entry => {
      if (entry.type === "action") {
        Config.setAction(entry.name, entry);
      }
    });

    console.log("Configuration loaded");
  }

  static async store(guild: Guild) {
    const admin = guild.channels.cache.find(ch => ch.name === "admin" && ch.type === "category") as CategoryChannel;
    const config = guild.channels.cache.find(ch => ch.name === "config" && ch.parent == admin && ch.type === "text") as TextChannel;
    const oldEntries = await Config.fetchEntries(guild);
    
    // Generate entries for the configuration
    const newEntries: ConfigEntry[] = Array.from(Config.actions.keys())
      .map(name => ({...Config.actions.get(name), type: "action", name: name} as ConfigEntry));
    let pending: Set<ConfigEntry> = new Set;
    let usedMsgs: Set<Snowflake> = new Set;

    newEntries.forEach(e1 => {
      // Search for an entry with the same name in oldEntries
      const e2 = oldEntries.find(e => e.type === e1.type && e.name === e1.name);
      if (e2) {
        // Check if they are different
        e1.msg = e2.msg;
        if (!deepEqual(e1, e2)) {
          // Add all of the entries in the same message to pending in that message
          oldEntries.filter(e => e.msg === e2.msg).forEach(e => pending.add(e));
          pending.add(e1);
          usedMsgs.add(e2.msg);
        }
      }
      else {
        pending.add(e1);
      }
    });

    // Remove duplicates from pending
    pending = new Set([...pending]
      .filter(e => !newEntries.find(e1 => e1.type === e.type && e1.name === e.name && !deepEqual(e1, e)))
    );

    // Send new entries in groups
    const prepare = (a: string) => "[" + a + "]";
    const empty = async (acc: string) => { await config.send({ content: prepare(acc), code: "json" }); };
    let acc: string = "";

    await pending.forEach(async e => {
      e.msg = undefined;
      const content = JSON.stringify(e);
      const newAcc = acc + (acc.length > 0 ? "," : "") + content;
      if (prepare(newAcc).length > 2000) { // Message limit, empty acc
        await empty(acc);
        acc = content;
      }
      else
        acc = newAcc;
    });

    if (acc !== "")
      await empty(acc);

    // Remove messages that were changed
    await usedMsgs.forEach(async msg => await config.messages.delete(msg));

    console.log("Configuration stored");
  }

  static setAction(name: string, config: ActionConfig) {
    const action = Config.actions.get(name);
    action.needsVote = config.needsVote;
    if (config.needsVote) {
      if (config.voteDuration)
        action.voteDuration = config.voteDuration;
      if (config.yesRatio)
        action.yesRatio = config.yesRatio;
      if (config.earlyVotes)
        action.earlyVotes = config.earlyVotes;
      if (config.lateVotes)
        action.lateVotes = config.lateVotes;

      if (!action.voteDuration)
        action.voteDuration = 12;
      if (!action.yesRatio)
        action.yesRatio = 0.5;
      if (!action.earlyVotes)
        action.earlyVotes = 10;
      if (!action.lateVotes)
        action.lateVotes = 5;
    }
  }
}
