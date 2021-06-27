import { CategoryChannel, Guild, Message, MessageComponentInteraction, Snowflake, TextChannel } from 'discord.js';
import Config from './config';
import * as Actions from './actions'

let voteDataCache: Map<Snowflake, {msg: Snowflake, action: Actions.Base}> = new Map;

type VoteData = {
  author: Snowflake;
  action: Actions.Base;
  msg: Snowflake;
  users: {id: Snowflake, yes: boolean}[];
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

async function fetchVoteDataCache(guild: Guild) {
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category") as CategoryChannel;
  const votes = guild.channels.cache.find(ch => ch.name === "votes" && ch.parent == bot && ch.type === "text") as TextChannel;

  (await votes.messages.fetch({limit: 100})).forEach(msg => {
    const json = msg.content.slice(7, msg.content.length - 4);
    const data = JSON.parse(json);
    voteDataCache[data.msg].msg = msg.id;
    voteDataCache[data.msg].action = Actions.updatePrototype(data.action);
  });
}

function isVoteDue(dataMsg: Message, data: VoteData) {
  return false;
}

export async function submitVote(interaction: MessageComponentInteraction) {
  const guild = interaction.guild;
  const channel = interaction.channel as TextChannel;
  const bot = guild.channels.cache.find(ch => ch.name === "bot" && ch.type === "category") as CategoryChannel;
  const votes = guild.channels.cache.find(ch => ch.name === "votes" && ch.parent == bot && ch.type === "text") as TextChannel;

  const publicMsg = await channel.messages.fetch(interaction.message.id);

  // Find data message
  let dataMsgId = voteDataCache[publicMsg.id].msg;
  if (!dataMsgId) {
    await fetchVoteDataCache(guild);
    dataMsgId = voteDataCache[publicMsg.id].msg;
  }

  if (!dataMsgId) {
    await interaction.reply({content: "Couldn't submit vote: vote data not found", ephemeral: true});
    return;
  }

  // Extract data
  const dataMsg = await votes.messages.fetch(dataMsgId);
  const json = dataMsg.content.slice(7, dataMsg.content.length - 4);
  const data = JSON.parse(json) as VoteData;
  const action: Actions.Base = voteDataCache[publicMsg.id].action;
  let dataUser = data.users.find(u => u.id == interaction.user.id);

  if (!action) {
    await interaction.reply({content: "Couldn't submit vote: vote data is invalid", ephemeral: true});
    return;
  }

  if (dataUser) {
    if (dataUser.yes && interaction.customID === "no") {
      data.yes -= 1;
      data.no += 1;
      dataUser.yes = false;
    }
    else if (!dataUser.yes && interaction.customID === "yes") {
      data.yes += 1;
      data.no -= 1;
      dataUser.yes = true;
    }
    else {
      await interaction.reply({content: "You've already voted with this option.", ephemeral: true});
      return;
    }
  }
  else {
    if (interaction.customID === "no") {
      data.users.push({ id: interaction.user.id, yes: false });
      data.no += 1;  
    }
    else {
      data.users.push({ id: interaction.user.id, yes: true });
      data.yes += 1;  
    }
  }

  // Check if voting ended
  const config = Config.actions[action.type];
  const totalVotes = data.yes + data.no;
  const yesRatio = data.yes / totalVotes;
  let decision = 0;

  if (isVoteDue(dataMsg, data)) {
    if (totalVotes >= config.lateVotes) {
      if (yesRatio >= config.yesRatio) {
        decision = 1;
      }
      else {
        decision = -1;
      }
    }
  }
  else if (data.yes >= config.earlyVotes && yesRatio >= config.yesRatio) {
    decision = 1;
  }

  // TODO: Provide better stats
  if (decision === 1) {
    await action.apply(guild);
    await interaction.reply({ content: `Vote counted.`, ephemeral: true });
    await publicMsg.edit({
      content: publicMsg.content
        .replace(/Yes: \d+/, `Yes: ${data.yes}`) 
        .replace(/No: \d+/, `No: ${data.no}`) +
        "\nVote finished: action applied",
      components: []
    });
    await dataMsg.delete();
    return;
  }
  else if (decision === -1) {
    await interaction.reply({ content: `Vote counted.`, ephemeral: true });
    await publicMsg.edit({
      content: publicMsg.content
        .replace(/Yes: \d+/, `Yes: ${data.yes}`) 
        .replace(/No: \d+/, `No: ${data.no}`) +
        "\nVote finished: action denied",
      components: []
    });
    await dataMsg.delete();
    return;
  }

  // Update data messages
  await dataMsg.edit({
    content: JSON.stringify(data),
    code: "json"
  });
  
  await publicMsg.edit({
    content: publicMsg.content
      .replace(/Yes: \d+/, `Yes: ${data.yes}`) 
      .replace(/No: \d+/, `No: ${data.no}`) 
  });

  await interaction.reply({ content: `Vote counted.`, ephemeral: true });
}