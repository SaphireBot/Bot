import { ChannelType } from "discord.js"
import { Database, SaphireClient as client } from "../../../classes/index.js"

/**
 * Crédito aos que ajudaram a fazer este comando
 * Código Fonte: Rody#1000 (451619591320371213)
 * Desafiantes que eu faria isso: ! ζ͜͡André#1495 (648389538703736833) & Nix X#1000 (807032718935326752)
 * Testers: ! ζ͜͡André#1495 (648389538703736833) & Leozinn#4649 (351144573415718914)
 */
export default new class TempCallManager {
    constructor() {
        this.guildsId = []
        this.inCall = {}
        this.inMute = {}
        this.guildsWithMuteCount = []
    }

    async load() {
        const guildCallsEnabled = await Database.Guild.find({ 'TempCall.enable': true }, "id TempCall")
        this.guildsId = guildCallsEnabled?.length ? guildCallsEnabled.map(g => g.id) : []
        this.guildsWithMuteCount = guildCallsEnabled?.length ? guildCallsEnabled.filter(g => g.TempCall?.muteTime).map(g => g.id) : []
        this.check()

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
                            if (member.user.bot) return
                            if (
                                this.guildsWithMuteCount.includes(guildId)
                                && (member.voice.selfMute
                                    || member.voice.selfDeaf
                                    || member.voice.serverMute
                                    || member.voice.serverDeaf)
                            )
                                return this.inMute[guildId][member.user.id] = Date.now()
                            else this.inCall[guildId][member.user.id] = Date.now()
                        }))

                continue
            }

        return
    }

    async check() {
        const guildsId = Object.keys(this.inCall) // [guildsId]
        const mutedId = Object.keys(this.inMute) // [guildsId]
        if (guildsId?.length) this.saveInCall(guildsId)
        if (mutedId?.length) this.saveInMute(mutedId)

        return setTimeout(() => this.check(), 1000 * 30)
    }

    async saveInCall(guildsId) {
        for (const guildId of guildsId) {
            const guildData = Object.entries(this.inCall[guildId] || {})
            if (!guildData?.length) continue

            // [["userId", Date.now()], ["userId", Date.now()]]
            const dataToSave = []

            for (const [memberId, time] of guildData) {
                dataToSave.push([`TempCall.members.${memberId}`, Date.now() - time])
                this.inCall[guildId][memberId] = Date.now()
            }
            await Database.Guild.updateOne(
                { id: guildId },
                { $inc: Object.fromEntries(dataToSave) },
                { upsert: true }
            )

            continue
        }
    }

    async saveInMute(guildsId) {
        for (const guildId of guildsId) {
            const guildData = Object.entries(this.inMute[guildId] || {})
            if (!guildData?.length) continue

            // [["userId", Date.now()], ["userId", Date.now()]]
            const dataToSave = []

            for (const [memberId, time] of guildData) {
                dataToSave.push([`TempCall.membersMuted.${memberId}`, Date.now() - time])
                this.inMute[guildId][memberId] = Date.now()
            }
            await Database.Guild.updateOne(
                { id: guildId },
                { $inc: Object.fromEntries(dataToSave) },
                { upsert: true }
            )

            continue
        }
    }
}