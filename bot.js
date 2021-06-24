require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client({ intents: Discord.Intents.ALL });

// ================================ Constants =================================

const ADMIN_ROLE_PERMS = [
    "MANAGE_MESSAGES",
    "MANAGE_EMOJIS",
    "MANAGE_NICKNAMES",
]

// Permission overwrites for the Meta category
const META_CATEGORY_PERMS = [
    {
        "id": 0, // @everyone
        "type": "role",
        "deny": ["SEND_MESSAGES"],
    },
]

const EVENTS_CHANNEL_PERMS = [
    {
        "id": 1, // @Admin
        "type": "role",
        "allow": ["SEND_MESSAGES"],
        "deny": ["MANAGE_MESSAGES"],
    },
]

// Permission overwrites for the Main category
const MAIN_CATEGORY_PERMS = [
]

// Permission overwrites for the VC category
const VC_CATEGORY_PERMS = [
]

// Permission overwrites for the Admin category
const ADMIN_CATEGORY_PERMS = [
    {
        "id": 0, // @everyone
        "type": "role",
        "deny": ["VIEW_CHANNEL"],
    },
    {
        "id": 1, // @Admin
        "type": "role",
        "allow": ["VIEW_CHANNEL"],
    },
]

// Permission overwrites for the Archive category
const ARCHIVE_CATEGORY_PERMS = [
    {
        "id": 0, // @everyone
        "type": "role",
        "deny": ["SEND_MESSAGES"],
    },
]

// Command data
const COMMAND_DATA = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'echo',
        description: 'Replies with your input!',
        options: [{
            name: 'input',
            type: 3, // STRING
            description: 'The input which should be echoed back',
            required: true,
        }],
    }
]

// ================================ Callbacks =================================

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.on('ready', async () => {
    console.log('Democracy bot online!');

    let guild = client.guilds.cache.first();
    if (guild == null) {
        guild = await create_guild();
    }

    client.application?.commands.set([]);

    // Load bot configuration from channels
    await load_config(guild);
});

client.on('guildMemberAdd', async member => {
    const guild = client.guilds.cache.first();
    
    if (guild.memberCount <= 2) {
        // Give bootstrap roles
        const roles = [
            guild.roles.cache.find(r => r.name === 'Admin'),
            guild.roles.cache.find(r => r.name === 'Citizen'),
            guild.roles.cache.find(r => r.name === 'Bootstrap'),
        ];
        await member.roles.add(roles);
    }
    else {
        // Server is considered 'started'
        await start_guild();
    }
});

client.on('interaction', async interaction => {
    console.log(interaction);
	if (!interaction.isCommand()) return;
	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
    else if (interaction.commandName === 'echo') {
		await interaction.reply(interaction.options.get('input').value);
	}
});

client.login(process.env.BOT_TOKEN)

// ============================== Implementation ==============================

async function create_guild() {
    const guild = await client.guilds.create("Democracy Guild", {
        roles: [
            {"id": 0},
            {"id": 1, "name": "Admin", "permissions": ADMIN_ROLE_PERMS},
            {"id": 2, "name": "Citizen"},
            {"id": 3, "name": "Bootstrap", "permissions": ["ADMINISTRATOR"]} // temporary role
        ],
        channels: [
            // Categories
            {"type": "category", "id": 0, "name": "Meta", "permissionOverwrites": META_CATEGORY_PERMS},
            {"type": "category", "id": 1, "name": "Main", "permissionOverwrites": MAIN_CATEGORY_PERMS},
            {"type": "category", "id": 2, "name": "VC", "permissionOverwrites": VC_CATEGORY_PERMS},
            {"type": "category", "id": 3, "name": "Admin", "permissionOverwrites": ADMIN_CATEGORY_PERMS},
            {"type": "category", "id": 4, "name": "Archive", "permissionOverwrites": ARCHIVE_CATEGORY_PERMS},

            // Info text channels
            {"type": "text", "parentID": 0, "name": "info"},
            {"type": "text", "parentID": 0, "name": "events", "permissionOverwrites": EVENTS_CHANNEL_PERMS},

            // Admin channels
        ]
    });

    const GuildChannel = guild.channels.cache.find(channel => channel.name == "info");
    const Invite = await GuildChannel.createInvite({maxAge: 0, unique: true, reason: "Testing."});
    console.log(`Created guild. Here's the invite code: ${Invite.url}`);
}

async function start_guild() {
    const guild = client.guilds.cache.first();
   
    // Delete bootstrap role
    const bootstrap_role = guild.roles.cache.find(r => r.name === 'Bootstrap');
    await bootstrap_role.delete("Server started");

    // Set commands
    await guild.commands.set(COMMAND_DATA);
}

async function load_config(guild) {
    // TODO
}

// =============================== AUX Functions ==============================

function to_channel_name(name) {
    return name.toLowerCase().replace(/ /g, '-');
}
