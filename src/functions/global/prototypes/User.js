import { User } from 'discord.js'
import { Database, SaphireClient as client } from '../../../classes/index.js'
import { Config as config } from '../../../util/Constants.js'

User.prototype.isVip = async function () {

    const userData = await Database.User.findOne({ id: this.id }, 'Vip')
    if (!userData) return false

    const DateNow = userData?.Vip?.DateNow || null
    const TimeRemaing = userData?.Vip?.TimeRemaing || 0

    if (userData?.Vip?.Permanent) return true

    return Date.Timeout(TimeRemaing, Date.now() - DateNow) || undefined
}

User.prototype.isMod = async function () {
    const clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores') || []
    const staff = [...clientData?.Administradores, ...clientData?.Moderadores, config.ownerId]
    return staff.includes(this.id)
}