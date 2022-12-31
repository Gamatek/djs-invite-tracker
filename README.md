# DiscordJS invite tracker

Find the invitation that was used when a member joins a server.

## Installation
```bash
wget 
```

## Example
```js
const { Client, Intents, WebhookClient } = require("discord.js");
const inviteTracker = require("./inviteTracker");

const guildId = "";
const webhook = {
    id: "",
    token: "",
    // or
    url: ""
};

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INVITES
    ]
});

const tracker = new inviteTracker(client);

tracker.on("cacheFechted", (cache) => {
    console.log(`Cache fetched with ${cache.size} invites`);
});

tracker.on("guildMemberAdd", (member, type, invite) => {
    if(member.guild.id !== guildId) return;
    if(type === "normal") {
        new WebhookClient(webhook).send({
            content: `<@${member.id}> has just joined. He was invited by **${invite.inviter.tag}**.`
        });
    } else if(type === "vanity") {
        new WebhookClient(webhook).send({
            content: `<@${member.id}> arrived using the personalized invitation.`
        });
    } else if(type === "oauth") {
        new WebhookClient(webhook).send({
            content: `<@${member.id}> has been just added.`
        });
    } else if(type === "unknown") {
        new WebhookClient(webhook).send({
            content: `<@${member.id}> has just joined, but I can't find out who invited him.`
        });
    };
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login("TOKEN");
```
