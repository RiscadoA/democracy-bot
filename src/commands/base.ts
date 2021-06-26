import * as Discord from "discord.js";
import * as Actions from "../actions"

export default abstract class Base {
    abstract data: Discord.ApplicationCommandData;
    abstract callback(interaction: Discord.CommandInteraction): Promise<Actions.Base>;
}