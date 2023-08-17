import { ChannelType } from "discord.js"
import { Database, SaphireClient as client } from "../../../classes/index.js"

/**
 * Crédito aos que ajudaram a fazer este comando
 * Código Fonte: Rody#1000 (451619591320371213)
 * Acharam que eu não conseguiria fazer isso: ! ζ͜͡André#1495 (648389538703736833) & Nix X#1000 (807032718935326752)
 * Testers: ! ζ͜͡André#1495 (648389538703736833) & Leozinn#4649 (351144573415718914)
 */
export default new class TempCallManager {
    constructor() {
        this.guildsId = []
        this.inCall = {}
        this.inMute = {}
        this.guildsWithMuteCount = []
    }

    async load(guildsData) {
        const guildCallsEnabled = guildsData.filter(gData => gData.TempCall?.enable)
        this.guildsId = guildCallsEnabled?.length ? guildCallsEnabled.map(g => g.id) : []
        this.guildsWithMuteCount = guildCallsEnabled?.length ? guildCallsEnabled.filter(g => g.TempCall?.muteTime).map(g => g.id) : []
        this.saveTime()

        if (this.guildsId?.length)
            for await (const guildId of this.guildsId) {
                const guild = await client.guilds.fetch(guildId || '0').catch(() => null)
                if (!guild) continue

                if (!this.inCall[guildId]) this.inCall[guildId] = {}
                if (!this.inMute[guildId]) this.inMute[guildId] = {}

                guild.channels.cache
                    .filter(channel => channel.type == ChannelType.GuildVoice && channel.members?.size)
                    .forEach(channel => channel.members
                        .forEach(member => {
                            if (!member.user.bot) {
                                this.guildsWithMuteCount.includes(guildId)
                                    && (member.voice.selfMute
                                        || member.voice.selfDeaf
                                        || member.voice.serverMute
                                        || member.voice.serverDeaf)
                                    ? this.inMute[guildId][member.user.id] = Date.now()
                                    : this.inCall[guildId][member.user.id] = Date.now()
                            }
                        }))

                continue
            }

        return
    }

    async saveTime() {

        const guildsId = Array.from(
            new Set([
                ...Object.keys(this.inCall || {}),
                ...Object.keys(this.inMute || {})
            ])
        )

        for await (const guildId of guildsId) {
            const inCall = Object.entries(this.inCall[guildId] || {})
            const inMute = Object.entries(this.inMute[guildId] || {})
            const toCheckState = []
            const dataToSave = []

            for await (const [memberId, time] of inCall) {
                if (this.inMute[guildId][memberId]) {
                    if (!toCheckState.includes(memberId)) toCheckState.push(memberId)
                    continue
                }
                dataToSave.push([`TempCall.members.${memberId}`, Date.now() - time])
                this.inCall[guildId][memberId] = Date.now()
                continue
            }

            for await (const [memberId, time] of inMute) {
                if (this.inCall[guildId][memberId]) {
                    if (!toCheckState.includes(memberId)) toCheckState.push(memberId)
                    continue
                }
                dataToSave.push([`TempCall.membersMuted.${memberId}`, Date.now() - time])
                this.inMute[guildId][memberId] = Date.now()
                continue
            }

            if (toCheckState.length) {
                const guild = await client.guilds.fetch(guildId).catch(() => null)
                if (guild) {

                    guild.channels.cache
                        .filter(channel => channel.type == ChannelType.GuildVoice && channel.members?.size)
                        .forEach(channel => channel.members
                            .forEach(member => {
                                if (!member.user.bot && toCheckState.includes(member.id)) {
                                    dataToSave.push([`TempCall.membersMuted.${member.id}`, Date.now() - this.inMute[guildId][member.id]])
                                    dataToSave.push([`TempCall.members.${member.id}`, Date.now() - this.inCall[guildId][member.id]])
                                    member.voice.selfMute
                                        || member.voice.selfDeaf
                                        || member.voice.serverMute
                                        || member.voice.serverDeaf
                                        ? (() => {
                                            this.inMute[guildId][member.id] = Date.now()
                                            delete this.inCall[guildId][member.id]
                                        })()
                                        : (() => {
                                            this.inCall[guildId][member.id] = Date.now()
                                            delete this.inMute[guildId][member.id]
                                        })()
                                }
                            }))

                }
            }

            if (dataToSave.length)
                await Database.Guild.findOneAndUpdate(
                    { id: guildId },
                    { $inc: Object.fromEntries(dataToSave) },
                    { upsert: true, new: true }
                )
                    .then(data => Database.saveGuildCache(data.id, data))
        }

        return setTimeout(() => this.saveTime(), 1000 * 15)
    }

}