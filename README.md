# 📧 Discord Invite Tracker

A powerful and efficient Discord.js invite tracking module that allows you to monitor and manage invites across your Discord servers.

## Features

- Track new members joining through specific invites
- Monitor invite creation and deletion
- Filter events by guild ID or custom guild filter
- Handle vanity URLs and bot joins
- Emit events for easy integration with your bot

## Installation

To install the library, run the following command:

```bash
npm i wave.djs.invite-tracker
```

## Usage

```js
const { Client, GatewayIntentBits } = require("discord.js");
const InviteTracker = require("wave.djs.invite-tracker");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites
    ]
});

const tracker = new InviteTracker(client);

tracker.on("guildMemberAdd", (member, type, invite) => {
    if (type === "normal") {
        console.log(`${member.user.tag} joined using invite code ${invite.code} from ${invite.inviter.tag}.`);
    } else if (type === "vanity") {
        console.log(`${member.user.tag} joined using the vanity invite link.`);
    } else if (type === "bot") {
        console.log(`${member.user.tag} was added to the server as a bot.`);
    } else {
        console.log(`${member.user.tag} joined, but I couldn't find what invite they used.`);
    };
});

tracker.on("inviteCreate", (invite) => {
    console.log(`New invite created: ${invite.code}`);
});

tracker.on("inviteDelete", (invite) => {
    console.log(`Invite deleted: ${invite.code}`);
});

client.login("YOUR_BOT_TOKEN");
```

## API

### `InviteTracker`

#### Constructor

- `constructor(client, options)`: Create a new InviteTracker instance.
- `options`:
  - `guildId`: {String} - Track invites only for this specific guild
  - `guildFilter`: {Function} - Custom filter function for guilds

## Events

- `guildMemberAdd`: Emitted when a new member joins a guild
  - Parameters: `member`, `type` ("normal", "vanity", "bot", "unknown", "permissions"), `invite`
- `inviteCreate`: Emitted when a new invite is created
  - Parameters: `invite`
- `inviteDelete`: Emitted when an invite is deleted
  - Parameters: `invite`
- `cacheFetched`: Emitted when the initial invite cache is fetched
  - Parameters: `cache`