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
    }

    async load() {
        const guildCallsEnabled = await Database.Guild.find({ 'TempCall.enable': true })
        this.guildsId = guildCallsEnabled?.length ? guildCallsEnabled.map(g => g.id) : []
        this.check()

        if (this.guildsId?.length)
            for await (const guildId of this.guildsId) {
                const guild = await client.guilds.fetch(guildId || '0').catch(() => null)
                if (!guild) continue

                if (!this.inCall[guildId])
                    this.inCall[guildId] = {}

                guild.channels.cache
                    .filter(channel => channel.type == ChannelType.GuildVoice && channel.members?.size)
                    .forEach(channel => {
                        for (const memberId of channel.members.filter(member => !member.user.bot).map(member => member.user.id))
                            this.inCall[guildId][memberId] = Date.now()
                    })

                continue
            }

        return
    }

    async check() {
        const guildsId = Object.keys(this.inCall) // [guildsId]
        if (guildsId?.length)
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
        return setTimeout(() => this.check(), 1000 * 30)
    }
}