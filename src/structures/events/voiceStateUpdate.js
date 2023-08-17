import { SaphireClient as client, Database, TempCallManager } from "../../classes/index.js"

client.on('voiceStateUpdate', async (oldState, newState) => {

    if (
        !TempCallManager.guildsId.includes(newState.guild.id)
        || newState.member.user.bot
    ) return

    const inMute = newState.selfMute || newState.selfDeaf || newState.serverMute || newState.serverDeaf
    if (newState.channel && !oldState.channel) return userJoin(newState.member.id, newState.guild.id, inMute)
    if (oldState.channel && !newState.channel) return userLeave(oldState.member.id, oldState.guild.id, oldState.channel)

    if (!inMute) return unmute(newState.member.id, newState.guild.id)
    if (!TempCallManager.guildsWithMuteCount.includes(newState.guild.id)) return
    if (inMute) return muted(newState.member.id, newState.guild.id)

    return
})

async function unmute(memberId, guildId) {
    if (!TempCallManager.inCall[guildId]) TempCallManager.inCall[guildId] = {}
    TempCallManager.inCall[guildId][memberId] = Date.now()

    if (TempCallManager.inMute[guildId][memberId]) {
        const time = TempCallManager.inMute[guildId][memberId]
        delete TempCallManager.inMute[guildId][memberId]
        await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $inc: { [`TempCall.membersMuted.${memberId}`]: Date.now() - time } },
            { upsert: true, new: true }
        )
            .then(data => Database.saveGuildCache(data.id, data))
    }

    return
}

async function muted(memberId, guildId) {
    if (!TempCallManager.inMute[guildId]) TempCallManager.inMute[guildId] = {}
    TempCallManager.inMute[guildId][memberId] = Date.now()

    if (TempCallManager.inCall[guildId][memberId]) {
        const time = TempCallManager.inCall[guildId][memberId]
        delete TempCallManager.inCall[guildId][memberId]
        await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $inc: { [`TempCall.members.${memberId}`]: Date.now() - time } },
            { upsert: true, new: true }
        )
            .then(data => Database.saveGuildCache(data.id, data))
    }

    return
}

async function userJoin(memberId, guildId, inMute) {
    if (inMute && TempCallManager.guildsWithMuteCount.includes(guildId))
        return TempCallManager.inMute[guildId][memberId] = Date.now()
    return TempCallManager.inCall[guildId][memberId] = Date.now()
}

async function userLeave(memberId, guildId) {

    if (!TempCallManager.inCall[guildId]) TempCallManager.inCall[guildId] = {}
    if (!TempCallManager.inMute[guildId]) TempCallManager.inMute[guildId] = {}

    const inCallTime = TempCallManager.inCall[guildId][memberId]
    const inMuteTime = TempCallManager.inMute[guildId][memberId]
    delete TempCallManager.inCall[guildId][memberId]
    delete TempCallManager.inMute[guildId][memberId]

    const dataToSave = {}

    if (inCallTime) dataToSave[`TempCall.members.${memberId}`] = Date.now() - inCallTime
    if (inMuteTime) dataToSave[`TempCall.membersMuted.${memberId}`] = Date.now() - inMuteTime

    if (Object.keys(dataToSave).length)
        await Database.Guild.findOneAndUpdate(
            { id: guildId },
            { $inc: { dataToSave } },
            { upsert: true, new: true }
        )
            .then(data => Database.saveGuildCache(data.id, data))

    return
}