import { SaphireClient as client, Database } from "../../classes/index.js"

client.on('voiceStateUpdate', async (oldState, newState) => {

    const guildsEnabled = await Database.Cache.TempCall.get('GuildsEnabled') || []
    if (!guildsEnabled.includes(oldState.guild.id)) return

    if (newState.member.user.bot) return
    if (oldState.channel && !newState.channel) return userLeave(oldState.member, newState.guild.id)
    if (newState.channel && !oldState.channel) return userJoin(oldState.member, newState.guild.id)
    return
})

async function userJoin(member, guildId) {
    return await Database.Cache.TempCall.set(`${guildId}.${member.id}`, Date.now())
}

async function userLeave(member, guildId) {

    const joinedAt = await Database.Cache.TempCall.get(`${guildId}.${member.id}`)
    await Database.Cache.TempCall.delete(`${guildId}.${member.id}`)
    if (!joinedAt) return
    await Database.Guild.updateOne(
        { id: guildId },
        { $inc: { [`TempCall.members.${member.id}`]: Date.now() - joinedAt } },
        { upsert: true }
    )
    return
}