import { ChannelManager } from 'discord.js'

ChannelManager.prototype.clientHasPermission = function (Permission) {
    return this.me.permissions.has(Permission)
}