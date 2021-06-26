import * as Discord from "discord.js";

export default abstract class Base {
    abstract data: Discord.ApplicationCommandData;
    abstract callback(interaction: Discord.CommandInteraction): Promise<void>;
}