import { GuildMemberRoleManager } from 'discord.js'

Object.defineProperty(GuildMemberRoleManager.prototype, 'lowest', {
    get: function () {
        return this.cache.reduce((prev, role) => (role.id !== role.guild.id && role.comparePositionTo(prev) < 0 ? role : prev), this.cache.first());
    }
})