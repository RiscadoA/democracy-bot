import * as Discord from "discord.js";
import * as Actions from "../actions"

export type Clearance = "admin" | "citizen" | "none";

export default abstract class Base {
    abstract clearance: Clearance;
    abstract data: Discord.ApplicationCommandData;
    abstract callback(interaction: Discord.CommandInteraction): Promise<Actions.Base>;
}