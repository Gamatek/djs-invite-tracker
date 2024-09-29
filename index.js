const { Client, Collection } = require("discord.js");
const { EventEmitter } = require("events");

/**
 * Maps invite data to a simplified object structure.
 * @param {Discord.Invite} invite - The invite object to map.
 * @returns {Object} Simplified invite data object.
 */
const mapInviteData = (invite) => {
    return {
        code: invite.code,
        uses: invite.uses,
        maxUses: invite.maxUses,
        inviterId: invite.inviterId,
        guildId: invite.guild.id
    };
};

/**
 * Compares cached invites with current invites to find the used invite.
 * @param {Collection<string, Object>} cachedInvites - Collection of cached invites.
 * @param {Discord.Collection<string, Discord.Invite>} currentInvites - Collection of current invites.
 * @returns {Discord.Invite|undefined} The used invite, if found.
 */
const compareInvites = (cachedInvites, currentInvites) => 
    currentInvites.find(invite => 
        invite.uses !== 0 &&
        cachedInvites.has(invite.code) &&
        cachedInvites.get(invite.code).uses < invite.uses
    );

/**
 * InvitesTracker class for tracking Discord invites.
 * @extends EventEmitter
 */
class InvitesTracker extends EventEmitter {
    /**
     * Create an InvitesTracker.
     * @param {Client} client - The Discord.js client instance.
     * @param {Object} [options] - Configuration options.
     * @param {string} [options.guildId] - ID of a specific guild to track.
     * @param {Function} [options.guildFilter] - Custom filter function for guilds.
     */
    constructor(client, options = {}) {
        super();
        this.client = client;
        this.cache = new Collection();
        this.options = {
            guildId: options.guildId,
            guildFilter: options.guildFilter
        };

        if (this.client.isReady()) {
            this.fetchCache();
        } else {
            this.client.once("ready", this.fetchCache.bind(this));
        };

        this.client.on("guildMemberAdd", this.handleGuildMemberAdd.bind(this));
        this.client.on("inviteCreate", this.handleInviteCreate.bind(this));
        this.client.on("inviteDelete", this.handleInviteDelete.bind(this));
    };

    /**
     * Handles a new member joining a guild.
     * @param {Discord.GuildMember} member - The member who joined.
     */
    handleGuildMemberAdd(member) {
        const { guildId, guildFilter } = this.options;
        if ((guildId && guildId !== member.guild.id) || (guildFilter && guildFilter(member.guild))) return;

        if (member.user.bot) {
            this.emit("guildMemberAdd", member, "bot", null);
            return;
        };

        const me = member.guild.members.me || member.guild.me;
        if (!me.permissions.has("MANAGE_GUILD")) {
            this.emit("guildMemberAdd", member, "permissions", null);
            return;
        };

        member.guild.invites.fetch()
            .then(currentInvites => {
                const inviteUsed = compareInvites(this.cache, currentInvites);
                if (inviteUsed) {
                    this.cache.set(inviteUsed.code, mapInviteData(inviteUsed));
                    this.emit("guildMemberAdd", member, "normal", inviteUsed);
                } else if (member.guild.vanityURLCode) {
                    this.emit("guildMemberAdd", member, "vanity", null);
                } else {
                    this.emit("guildMemberAdd", member, "unknown", null);
                };
            })
            .catch(() => {});
    };

    /**
     * Handles invite creation.
     * @param {Discord.Invite} invite - The created invite.
     */
    handleInviteCreate(invite) {
        const { guildId, guildFilter } = this.options;
        if ((guildId && guildId !== invite.guild.id) || (guildFilter && guildFilter(invite.guild))) return;

        const data = mapInviteData(invite);
        this.cache.set(invite.code, data);
        this.emit("inviteCreate", data);
    };

    /**
     * Handles invite deletion.
     * @param {Discord.Invite} invite - The deleted invite.
     */
    handleInviteDelete(invite) {
        const { guildId, guildFilter } = this.options;
        if ((guildId && guildId !== invite.guild.id) || (guildFilter && guildFilter(invite.guild))) return;

        const data = this.cache.get(invite.code);
        this.cache.delete(invite.code);
        this.emit("inviteDelete", data);
    };

    /**
     * Fetches and caches invites for a specific guild.
     * @param {string} guildId - The ID of the guild to fetch invites for.
     * @returns {Promise<void>}
     */
    async fetchGuildCache(guildId) {
        try {
            const guild = await this.client.guilds.fetch(guildId);
            const invites = await guild.invites.fetch();
            invites.forEach(invite => {
                this.cache.set(invite.code, mapInviteData(invite));
            });
        } catch (error) {
            console.error(`Failed to fetch invites for guild ${guildId}:`, error);
        };
    };

    /**
     * Fetches and caches invites for all accessible guilds.
     * @fires InvitesTracker#cacheFetched
     */
    async fetchCache() {
        try {
            const guilds = await this.client.guilds.fetch();
            await Promise.all(guilds.map(guild => this.fetchGuildCache(guild.id)));
            /**
             * Cache fetched event.
             * @event InvitesTracker#cacheFetched
             * @type {Collection<string, Object>}
             */
            this.emit("cacheFetched", this.cache);
        } catch (error) {
            console.error("Failed to fetch cache:", error);
        };
    };
};

module.exports = InvitesTracker;