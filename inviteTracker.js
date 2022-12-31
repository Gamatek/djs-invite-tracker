const { Client, Collection } = require("discord.js");
const { EventEmitter } = require("events");

const mapInviteData = (invite) => {
    return {
        code: invite.code,
        uses: invite.uses,
        maxUses: invite.maxUses
    };
};

const compareInvites = (cachedInvites, currentInvites) => {
    return currentInvites.find((invite) => 
        invite.uses !== 0
        && cachedInvites.has(invite.code)
        && cachedInvites.get(invite.code).uses < invite.uses
    );
};

class InvitesTracker extends EventEmitter {
    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        super();
        this.client = client;
        this.cache = new Collection();

        if(this.client.isReady()) {
            this.fetchCache();
        } else {
            this.client.on("ready", () => {
                this.fetchCache();
            });
        };

        this.client.on("guildMemberAdd", (member) => {
            if(member.user.bot) {
                this.emit("guildMemberAdd", member, "oauth", null);
            } else {
                if(member.guild.me.permissions.has("MANAGE_GUILD")) {
                    member.guild.invites.fetch().then((currentInvites) => {
                        const inviteUsed = compareInvites(this.cache, currentInvites);
                        if(inviteUsed) {
                            this.emit("guildMemberAdd", member, "normal", inviteUsed);
                            this.cache.set(inviteUsed.code, mapInviteData(inviteUsed));
                        } else {
                            if(member.guild.features.includes("VANITY_URL")) {
                                this.emit("guildMemberAdd", member, "vanity", null);
                            } else {
                                this.emit("guildMemberAdd", member, "unknown", null);
                            };
                        };
                    }).catch(() => {});
                } else {
                    this.emit("guildMemberAdd", member, "permissions", null);
                };
            };
        });

        this.client.on("inviteCreate", (invite) => {
            this.cache.set(invite.code, mapInviteData(invite));
        });

        this.client.on("inviteDelete", (invite) => {
            this.cache.delete(invite.code);
        });
    };

    fetchGuildCache = (guildId) => {
        return new Promise((resolve) => {
            this.client.guilds.fetch(guildId).then((guild) => {
                guild.invites.fetch().then((invites) => {
                    invites.map((invite) => {
                        this.cache.set(invite.code, mapInviteData(invite));
                    });
                    resolve();
                }).catch(() => {
                    resolve();
                });
            });
        });
    };

    fetchCache = () => {
        this.client.guilds.fetch().then((guilds) => {
            Promise.all(
                guilds.map(({ id }) => this.fetchGuildCache(id))
            ).then(() => {
                this.emit("cacheFetched", this.cache);
            });
        });
    };
};

module.exports = InvitesTracker;