# 📧 DiscordJS invite tracker

Find the invitation that was used when a member joins a server.

Inspired by the project [discord-invites-tracker](https://github.com/Androz2091/discord-invites-tracker), I coded an *invite tracker* more simply.

## Installation
```bash
wget https://raw.githubusercontent.com/Gamatek/djs-invite-tracker/main/inviteTracker.js
```

## Example
```js
const { Client, Intents, WebhookClient } = require("discord.js");
const inviteTracker = require("./inviteTracker");

const guildId = "GUILD_ID";
const webhook = {
    id: "WEBHOOK_ID",
    token: "WEBHOOK_TOKEN",
    // or
    url: "WEBHOOK_URL"
};

// servers that contain "nude" in their name will not be processed, if you want
const exemptGuild = (guild) => guild.name.includes("nude");

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
    // if(member.guild.id !== guildId) return; Only one server
    if(exemptGuild(guild)) return;
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

client.login("BOT_TOKEN");
```

## Different join types available:
* `normal` - When a member joins using an invite and the package knows who invited the member (`invite` is available).
* `vanity` - When a member joins using an invite with a custom URL (for example https://discord.gg/discord-api).
* `permissions` - When a member joins but the bot doesn't have the `MANAGE_GUILD` permission.
* `oauth2` - When a bot joins.
* `unknown` - When a member joins but the bot doesn't know how they joined.
