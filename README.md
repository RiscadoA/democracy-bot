# Democracy Discord bot

This project aims to develop a self-hosted discord bot which creates and manages
its own server. This way, no server member is the owner, and so, it is possible
to implement some kind of democracy where the members of the server elect N
admins/moderators periodically. Users are awarded 'citizenship' when they've
achieved some kind of activity quota (for example, 1k messages and 1 month
membership). Only users with 'citizenship' may vote and register as candidates
for elections.

## Configuration

The bot should be configured using commands, which need to be aproved by a
number of citizens. For example, a moderator wants to increase the term period
from 1 month to 2 months. For this, the moderator executes a command starts a
vote. If the vote is successful, the period is changed automatically.
The configuration is stored on a messages channel in a hidden category which is
read-only to moderators. The bot edits this message as needed, and reads it when
starting.

## Limitations

The bot by default only supports five channel categories (shown in this order):
- Info: for server information, picking roles, announcements, voting.
- Main: text channels.
- VC: voice channels and hidden text channels which become visible when joining the voice channels.
- Admin: has a text and voice channel for communication between admins. 
- Archive: category with archived channels.

An extra 'Bot' category is also created which is only visible and editable by the bot itself.

## Moderation

Admins have the following permissions:
- Manage server 
- Mention @everyone, @here and all roles
- Manage messages

### Actions

Most actions are made through specific commands:

- `/kick <member>` & `/ban <member>`: If the targeted member is a citizen, a vote
starts and only if it is approved by a certain number of citizens will the action
execute.
- `/create text <name> [roles]`: Creates a new text channel in the main
category only visible to the admins and roles listed after the channel name.
If the list is empty, the channel is made public to everyone.
- `/create voice <name> [roles]`: Creates a new voice and text channel pair
in the VC category only visible to the admins and roles listed after the channel name.
If the list is empty, the channels are made public to everyone. The text channel is
only visible to an user when they join the voice channel.
- `/move <channel_1> above|below <channel_2>`: Changes the channel order to that
channel_1 appears above or below channel_2. The channels must be in the same category
(either Main or VC).
- `/delete <channel>`: Deletes a text channel or voice/text channel pair. A vote
starts and only if it is approved by a certain number of citizens will the action
execute. The channels are never really deleted, just moved to an hidden category
so that the changes can be undoed.
- `/trash`: Shows which channels were deleted and can be restored
- `/restore`: Restores a channel which was deleted.
- `/undo`: Undoes the previous action (except `/kick`). May require a vote, depending on the command made.
- `/save`: Stores actions made to a message.
- `/load <msg_id>`: Restores server to a previous state from a message written by `/save` in the past.
Requires a vote.
- `/create role <name>`: Creates a new role with a given name.
- `/rank <role> <above_role>`: Creates a new role such 
- `/invite_bot <invite_url>`: Starts a vote to invite a new bot to the server. 'Manage server'
permission is added temporarily to the admin user, until they add the bot to the server or
too much time passes. Any bot that is invited which doesn't match the of ID of the URL
posted is kicked.
- `/rename <channel> <name>`: Renames a text channel or a voice/text channel pair.
- `/set guild name <name>`: Renames the guild.
- `/set guild icon`: Sets the guild icon to the attached image.
- `/set guild banner`: Sets the guild banner to the attached image.

## Setup

This repository should be forked so that server members can create pull requests
and propose changes to the bots functionality. The bot is implemented using node.js
and [discord.js](https://github.com/discordjs/discord.js). The environment variable
BOT_TOKEN should be set to the bot token.
