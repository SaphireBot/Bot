import { User } from 'discord.js'
import { Database } from '../../../classes/index.js'

User.prototype.isVip = async function () {

    const userData = await Database.User.findOne({ id: this.id }, 'Vip')
    if (!userData) return false

    const DateNow = userData?.Vip?.DateNow || null
    const TimeRemaing = userData?.Vip?.TimeRemaing || 0

    if (userData?.Vip?.Permanent) return true

    return Date.Timeout(TimeRemaing, Date.now() - DateNow) || undefined

}