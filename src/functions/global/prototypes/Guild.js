import { Guild } from 'discord.js'

Guild.prototype.clientHasPermission = function (Permission) {
    return this.me.permissions.has(Permission)
}

Object.defineProperty(Guild.prototype, 'allMembers', {
    get: function () {
        return this.members.fetch()
    }
})