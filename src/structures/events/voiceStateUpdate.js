import { SaphireClient as client, Database, TempCallManager } from "../../classes/index.js"

client.on('voiceStateUpdate', async (oldState, newState) => {

    if (!TempCallManager.guildsId.includes(oldState.guild.id)) return

    if (newState.member.user.bot) return
    if (newState.channel && !oldState.channel) return userJoin(newState.member.id, newState.guild.id, newState.channel)
    if (oldState.channel && !newState.channel) return userLeave(oldState.member.id, oldState.guild.id, oldState.channel)
    return
})

async function userJoin(memberId, guildId) {
    return TempCallManager.inCall[guildId][memberId] = Date.now()
}

async function userLeave(memberId, guildId) {
    if (TempCallManager.inCall[guildId][memberId])
        await Database.Guild.updateOne(
            { id: guildId },
            { $inc: { [`TempCall.members.${memberId}`]: Date.now() - TempCallManager.inCall[guildId][memberId] } },
            { upsert: true }
        )

    delete TempCallManager.inCall[guildId][memberId]
    return
}