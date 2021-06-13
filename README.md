# Democracy Discord bot

This project aims to develop a self-hosted discord bot
which creates and manages its own server. This way, no
server member is the owner, and so, it is possible
to implement some kind of democracy where the members of
the server elect N admins/moderators periodically.
Users are awarded 'citizenship' when they've achieved
some kind of activity quota (for example, 1k messages
and 1 month membership). Only users with 'citizenship'
may vote and register as candidates to elections.

## Configuration

The bot should be configured using commands, which need
to be aproved by a number of citizens. For example, a
moderator wants to increase the term period from 1 month
to 2 months. For this, the moderator executes a command
starts a vote. If the vote is successful, the period is
changed automatically.

## Moderation

Kicking and banning users should be made through specific
commands. Citizens may only be kicked or banned through
popular vote.

## Setup

This repository should be forked so that server members
can create pull requests and propose changes to the bots
functionality.
