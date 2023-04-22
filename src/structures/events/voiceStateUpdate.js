import { SaphireClient as client, Database } from "../../classes/index.js"

client.on('voiceStateUpdate', async (oldState, newState) => {

    const guildsEnabled = await Database.Cache.TempCall.get('GuildsEnabled') || []
    if (!guildsEnabled.includes(oldState.guild.id)) return

    if (newState.member.user.bot) return
    if (newState.channel && !oldState.channel) return userJoin(newState.member.id, newState.guild.id, newState.channel)
    if (oldState.channel && !newState.channel) return userLeave(oldState.member.id, oldState.guild.id, oldState.channel)
    return
})

async function userJoin(memberId, guildId, channel) {
    await Database.Cache.TempCall.set(`${guildId}.inCall.${channel.id}`, channel.members.map(ch => ch.id))
    return await Database.Cache.TempCall.set(`${guildId}.${memberId}`, Date.now())
}

async function userLeave(memberId, guildId, channel) {
    await Database.Cache.TempCall.set(`${guildId}.inCall.${channel.id}`, channel.members.map(ch => ch.id))
    const joinedAt = await Database.Cache.TempCall.get(`${guildId}.${memberId}`)
    if (!joinedAt) return
    await Database.Cache.TempCall.delete(`${guildId}.${memberId}`)
    await Database.Guild.updateOne(
        { id: guildId },
        { $inc: { [`TempCall.members.${memberId}`]: Date.now() - joinedAt } },
        { upsert: true }
    )
    return
}