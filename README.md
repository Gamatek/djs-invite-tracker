# 📧 DiscordJS invite tracker

Find the invitation that was used when a member joins a server.
Inspired by the project [discord-invites-tracker](https://github.com/Androz2091/discord-invites-tracker).
I coded an *invite tracker* more simply, compatible with Discord.JS version 13 and 14.

## Installation
```bash
git clone https://github.com/Gamatek/djs-invite-tracker.git
```

## Example tracker
```js
// Signle server
const tracker = new inviteTracker(client, {
    guildId: "GUILD_ID"
});

// More servers
const tracker = new inviteTracker(client, {
    guildFilter: (guild) =>  guild.name.includes("nude"); // Servers that contain "nude" in their name will not be processed.
});

tracker.on("guildMemberAdd", (member, type, invite) => {
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
```

## Example with Discord.JS v13
```js
const { Client, Intents, WebhookClient } = require("discord.js");
const inviteTracker = require("./inviteTracker");

const webhook = {
    id: "WEBHOOK_ID",
    token: "WEBHOOK_TOKEN",
    // or
    url: "WEBHOOK_URL"
};

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INVITES
    ]
});

const tracker = new inviteTracker(client);

tracker.on("cacheFetched", (cache) => {
    console.log(`Cache fetched with ${cache.size} invites`);
});

tracker.on("inviteCreate", (invite) => {
    new WebhookClient(webhook).send({
        content: `<@${invite.inviterId}> has created a new invite. (\`${invite.code}\`)`
    });
});

tracker.on("inviteDelete", (invite) => {
    new WebhookClient(webhook).send({
        content: `The invite \`${invite.code}\` created by **${invite.inviter.tag}** has been deleted.`
    });
});

tracker.on("guildMemberAdd", (member, type, invite) => {
    ...
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login("BOT_TOKEN");
```

## Events available
* `cacheFetched` - (cache)
* `guildMemberAdd` - (member, type, invite)
* `inviteCreate` - (invite)
* `inviteDelete` - (invite)

## Different join types of invite available
* `normal` - When a member joins using an invite and the package knows who invited the member (`invite` is available).
* `vanity` - When a member joins using an invite with a custom URL (for example https://discord.gg/discord-api).
* `permissions` - When a member joins but the bot doesn't have the `MANAGE_GUILD` permission.
* `oauth2` - When a bot joins.
* `unknown` - When a member joins but the bot doesn't know how they joined.
