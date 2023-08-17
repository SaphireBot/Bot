import { Guild } from 'discord.js'
import { Database } from '../../../classes/index.js'
import { PermissionsBitToString } from '../../../util/Constants.js'
import { Emojis as e } from '../../../util/util.js'

Guild.prototype.clientHasPermission = function (Permission) {
    return this.members.me.permissions.has(PermissionsBitToString[Permission], true)
}

Guild.prototype.getCoin = async function () {
    const guildData = await Database.getGuild(this.id)
    return guildData?.Moeda || `${e.Coin} Safiras`
}

Object.defineProperty(Guild.prototype, 'allMembers', {
    get: function () {
        return this.members.fetch()
    }
})