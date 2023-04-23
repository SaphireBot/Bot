import { SaphireClient as client, Database, TempCallManager } from "../../classes/index.js"

client.on('voiceStateUpdate', async (oldState, newState) => {

    if (!TempCallManager.guildsId.includes(newState.guild.id)) return
    if (newState.member.user.bot) return

    const inMute = newState.selfMute || newState.selfDeaf || newState.serverMute || newState.serverDeaf
    if (newState.channel && !oldState.channel) return userJoin(newState.member.id, newState.guild.id, newState.channel, inMute)
    if (oldState.channel && !newState.channel) return userLeave(oldState.member.id, oldState.guild.id, oldState.channel)

    if (!inMute) return inCallUser(newState.member.id, newState.guild.id)
    if (!TempCallManager.guildsWithMuteCount.includes(newState.guild.id)) return
    if (inMute) return mutedUser(newState.member.id, newState.guild.id)

    return
})

async function inCallUser(memberId, guildId) {
    delete TempCallManager.inMute[guildId][memberId]
    if (!TempCallManager.inCall[guildId]) TempCallManager.inCall[guildId] = {}
    if (!TempCallManager.inCall[guildId][memberId])
        TempCallManager.inCall[guildId][memberId] = Date.now()
}

async function mutedUser(memberId, guildId) {
    delete TempCallManager.inCall[guildId][memberId]
    if (!TempCallManager.inMute[guildId]) TempCallManager.inMute[guildId] = {}
    if (!TempCallManager.inMute[guildId][memberId])
        TempCallManager.inMute[guildId][memberId] = Date.now()
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
        await Database.Guild.updateOne(
            { id: guildId },
            { $inc: { dataToSave } },
            { upsert: true }
        )

    return
}