import { Database, SaphireClient as client } from '../../../classes/index.js'
import { Config as config } from '../../../util/Constants.js'
import { User } from 'discord.js'

User.prototype.isVip = async function () {

    const userData = await Database.getUser(this.id)
    if (!userData) return false

    if (userData?.Vip?.Permanent) return true
    const DateNow = userData?.Vip?.DateNow || null
    const TimeRemaing = userData?.Vip?.TimeRemaing || 0

    return TimeRemaing - (Date.now() - DateNow) > 0
}

User.prototype.isMod = async function () {
    const clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores') || []
    const staff = [...clientData?.Administradores, ...clientData?.Moderadores, config.ownerId]
    return staff.includes(this.id)
}

User.prototype.balance = async function () {

    const userData = await Database.getUser(this.id)

    if (!userData || !userData.Balance) return 0

    return parseInt(userData.Balance) || 0
}

User.prototype.color = async function () {

    const userData = await Database.getUser(this.id)
    if (!userData || !userData?.Color.Perm || !userData?.Color.Set) return client.blue

    return client.blue
}