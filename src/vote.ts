import { CategoryChannel, Guild, Message, MessageComponentInteraction, Snowflake, TextChannel } from 'discord.js';
import Config from './config';
import * as Actions from './actions'

let voteDataCache: Map<Snowflake, {msg: Snowflake, action: Actions.Base}> = new Map;

type VoteData = {
  author: Snowflake;
  action: Actions.Base;
  msg: Snowflake;
  users: {id: Snowflake, answer: "yes" | "no"}[];
  yes: number;
  no: number;
}

export async function startVote(guild: Guild, author: Snowflake, action: Actions.Base) {
  const meta = guild.channels.cache.find(ch => ch.name === "meta" && ch.type === "category") as CategoryChannel;
  const democracy = guild.channels.cache.find(ch => ch.name === "democracy" && ch.parent == meta && ch.type === "text") as TextChannel;
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category") as CategoryChannel;
  const votes = guild.channels.cache.find(ch => ch.name === "votes" && ch.parent == bot && ch.type === "text") as TextChannel;

  const msg = await democracy.send({
    content: `A vote was started by <@${author}> to execute the action '${action.what()}'. ` +
             `Current results:\nYes: 0\nNo: 0`,
    components: [[
      {
        type: "BUTTON",
        label: "Yes",
        customID: "yes",
        style: "SUCCESS",
      },
      {
        type: "BUTTON",
        label: "No",
        customID: "no",
        style: "DANGER",
      }
    ]]
  });

  const data: VoteData = {
    author: author,
    action: action,
    msg: msg.id,
    users: [],
    yes: 0,
    no: 0,
  };

  voteDataCache[msg.id] = {
    msg: await votes.send({
      content: JSON.stringify(data),
      code: "json"
    }),
    action: action
  };
}

function msgToData(msg: Message): any {
  if (msg.content.startsWith("```json")) {
    const json = msg.content.slice(7, msg.content.length - 4);
    return JSON.parse(json);
  }
}

async function fetchVoteDataCache(guild: Guild) {
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category") as CategoryChannel;
  const votes = guild.channels.cache.find(ch => ch.name === "votes" && ch.parent == bot && ch.type === "text") as TextChannel;

  (await votes.messages.fetch({limit: 100})).forEach(msg => {
    const data = msgToData(msg) as VoteData;
    if (data) {
      voteDataCache[data.msg] = {
        msg: msg.id,
        action: Actions.updatePrototype(data.action),
      }
    }
  });
}

async function fetchVotePrivMsg(guild: Guild, publicMsg: Snowflake) {
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category") as CategoryChannel;
  const votes = guild.channels.cache.find(ch => ch.name === "votes" && ch.parent == bot && ch.type === "text") as TextChannel;

  if (!voteDataCache[publicMsg]?.msg) {
    await fetchVoteDataCache(guild);
  }

  if (voteDataCache[publicMsg]?.msg) {
    return await votes.messages.fetch(voteDataCache[publicMsg].msg);
  }
}

async function fetchVotePublicMsg(guild: Guild, publicMsg: Snowflake) {
  const meta = guild.channels.cache.find(ch => ch.name === "votes" && ch.type === "category") as CategoryChannel;
  const democracy = guild.channels.cache.find(ch => ch.name === "democracy" && ch.parent == meta && ch.type === "text") as TextChannel;
  return await democracy.messages.fetch(publicMsg);
}

function checkVoteStatus(guild: Guild, privMsg: Message, data: VoteData) {
  const citizen = guild.roles.cache.find(r => r.name === "Citizen");

  // Check if voting ended
  const config = Config.actions.get(data.action.type);
  if (!config || !config.needsVote) {
    console.error("updateVoteStatus() failed:\nAction was not configured");
    return;
  }

  // Get config data
  let earlyVotes = config.earlyVotes;
  if (earlyVotes > citizen.members.size) {
    earlyVotes = citizen.members.size;
  }

  let lateVotes = config.lateVotes;
  if (lateVotes > citizen.members.size) {
    lateVotes = citizen.members.size;
  }

  // Get vote status
  const totalVotes = data.yes + data.no;
  const yesRatio = data.yes / totalVotes;

  // If vote is due
  if (new Date().getTime() - privMsg.createdAt.getTime() >= config.voteDuration * 3600 * 1000) {
    if (totalVotes >= lateVotes) {
      if (yesRatio >= config.yesRatio) {
        return 1;
      }
      else {
        return -1;
      }
    }
  }
  // If vote isn't due
  else if (totalVotes >= earlyVotes && yesRatio >= config.yesRatio) {
    return 1;
  }

  return 0;
}

async function acceptVote(guild: Guild, privMsg: Message, data: VoteData) {
  const publicMsg = await fetchVotePublicMsg(guild, data.msg);

  try {
    await data.action.apply(guild);
    await Actions.logAction(guild, data.action);
  }
  catch (err) {
    await publicMsg.reply("Couldn't apply action!");
  }

  await publicMsg.edit({
    content: publicMsg.content
      .replace(/Yes: \d+/, `Yes: ${data.yes}`) 
      .replace(/No: \d+/, `No: ${data.no}`) +
      "\nVote finished: action applied",
    components: []
  });

  await privMsg.delete();
}

async function denyVote(guild: Guild, privMsg: Message, data: VoteData) {
  const publicMsg = await fetchVotePublicMsg(guild, data.msg);

  await publicMsg.edit({
    content: publicMsg.content
      .replace(/Yes: \d+/, `Yes: ${data.yes}`) 
      .replace(/No: \d+/, `No: ${data.no}`) +
      "\nVote finished: action denied",
    components: []
  });

  await privMsg.delete();
}

async function updateVoteStatus(guild: Guild, privMsg: Message, data: VoteData) {
  const status = checkVoteStatus(guild, privMsg, data);  

  if (status === 1) {
    await acceptVote(guild, privMsg, data);
  }
  else if (status === -1) {
    await denyVote(guild, privMsg, data);
  }
}

// TODO: Restructure function
export async function submitVote(interaction: MessageComponentInteraction) {
  const guild = interaction.guild;
  const channel = interaction.channel as TextChannel;
  const citizen = guild.roles.cache.find(r => r.name === "Citizen");
  const member = await guild.members.fetch(interaction.member.user.id);
  if (interaction.customID !== "yes" && interaction.customID !== "no") {
    return;
  }

  // Limit vote to citizens
  if (!member.roles.cache.find(r => r.id == citizen.id)) {
    await interaction.reply({content: "Couldn't submit vote: you must be a citizen to vote", ephemeral: true});
    return;
  }

  // Get messages
  const publicMsg = await channel.messages.fetch(interaction.message.id);
  const privMsg = await fetchVotePrivMsg(guild, publicMsg.id);
  if (!privMsg) {
    await interaction.reply({content: "Couldn't submit vote: vote data not found", ephemeral: true});
    return;
  }

  // Extract vote data from private message
  const data = msgToData(privMsg) as VoteData;
  data.action = voteDataCache[publicMsg.id].action; // Reuse action from cache
  if (!data.action) {
    await interaction.reply({content: "Couldn't submit vote: vote data is invalid", ephemeral: true});
    return;
  }

  // Get user vote data
  const userData = data.users.find(u => u.id == interaction.user.id); 
  if (userData) { // Voted before
    if (userData.answer === interaction.customID) {
      await interaction.reply({content: "You've already voted with this option.", ephemeral: true});
      return;
    }
    else {
      data[interaction.customID] += 1;
      data[userData.answer] -= 1;
      userData.answer = interaction.customID;
    }
  }
  else { // First time voting
    data.users.push({ id: interaction.user.id, answer: interaction.customID });
    data[interaction.customID] += 1;
  }

  // Edit public message
  await publicMsg.edit({
    content: publicMsg.content
      .replace(/Yes: \d+/, `Yes: ${data.yes}`) 
      .replace(/No: \d+/, `No: ${data.no}`) 
  });

  await interaction.reply({content: "Vote counted!", ephemeral: true})

  // Update data message
  await privMsg.edit({
    content: JSON.stringify(data),
    code: "json"
  });

  // Update vote status
  await updateVoteStatus(guild, privMsg, data);
}