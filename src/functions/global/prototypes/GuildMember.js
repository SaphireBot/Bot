import { GuildMember, PermissionFlagsBits } from 'discord.js'

GuildMember.prototype.memberPermissions = function (Permission) {
    return this.permissions.has(Permission)
}

GuildMember.prototype.isManageableBy = function (member) {
    if (this.id === this.guild.ownerId) return false
    if (this.id === member.id) return
    if (member.id === this.guild.ownerId) return true
    return member.roles.highest.comparePositionTo(this.roles.highest) > 0
}

GuildMember.prototype.isBannablebleBy = function (member) {
    return this.isManageableBy(member) && member.permissions.has(PermissionFlagsBits.BanMembers)
}

GuildMember.prototype.isKickableBy = function (member) {
    return this.isManageableBy(member) && member.permissions.has(PermissionFlagsBits.KickMembers)
}

GuildMember.prototype.isModeratableBy = function (member) {
    return this.isManageableBy(member)
        && member.permissions.has(PermissionFlagsBits.ModerateMembers)
        && !this.permissions.has(PermissionFlagsBits.Administrator)
}

Object.defineProperty(GuildMember.prototype, 'isAdm', {
    get: function () {
        return this.permissions.has(PermissionFlagsBits.Administrator)
    }
})