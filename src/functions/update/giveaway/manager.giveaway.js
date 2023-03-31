import { Routes } from 'discord.js'
import { SaphireClient as client, Database, } from '../../../classes/index.js'

export default new class GiveawayManager {
    constructor() {
        this.giveaways = []
        this.awaiting = []
        this.toDelete = []
        this.onCheck = []
        this.retryCooldown = {}
    }

    async setGiveaways() {

        const giveawaysFromGuilds = await Database.Guild.find({
            id: { $in: [...client.guilds.cache.keys()] }
        }, 'id Giveaways')

        if (!giveawaysFromGuilds || !giveawaysFromGuilds.length) return

        const fill = giveawaysFromGuilds
            .filter(data => data.Giveaways?.length > 0)
            .map(data => data.Giveaways)
            .flat()
            .filter(i => i)

        return this.filterAndManager(fill)
    }

    async filterAndManager(giveaway = []) {
        if (!giveaway || !giveaway.length) return

        this.selectGiveaways(giveaway.filter(data => data.Actived))
        this.managerUnavailablesGiveaways(giveaway.filter(data => !data.Actived))

        return
    }

    async selectGiveaways(giveaways = []) {
        if (!giveaways.length) return

        for await (const gw of giveaways) {

            const timeMs = (gw.DateNow + gw.TimeMs) - Date.now()

            if (timeMs > 2147483647) {
                this.awaiting.push(gw)
                continue
            }

            if (timeMs <= 1000) {
                this.giveaways.push(gw)
                client.emit('giveaway', gw)
                continue
            }

            const timeout = setTimeout(() => client.emit('giveaway', gw), timeMs)
            gw.timeout = timeout
            this.giveaways.push(gw)
            continue
        }

        if (this.onCheck) this.checkBits()
        return
    }

    checkBits() {
        this.onCheck = true

        if (!this.awaiting.length)
            return this.onCheck = false

        for (let gw of this.awaiting) {
            const time = (gw.DateNow + gw.TimeMs) - Date.now()
            if (time < 2147483647) {
                this.giveaways.push(gw)
                this.selectGiveaways([gw])
                this.awaiting.splice(this.awaiting.findIndex(g => g.MessageID === gw.MessageID), 1)
                continue
            } else continue
        }

        return setTimeout(() => this.checkBits(), 600000)
    }

    async managerUnavailablesGiveaways(giveaways = []) {
        if (!giveaways.length) return

        for await (const gw of giveaways) {

            if (this.giveaways.some(giveaway => giveaway?.MessageID == gw.MessageID))
                this.giveaways.splice(this.giveaways.findIndex(giveaway => giveaway?.MessageID == gw.MessageID), 1)

            if (this.awaiting.some(giveaway => giveaway?.MessageID == gw.MessageID))
                this.awaiting.splice(this.awaiting.findIndex(giveaway => giveaway?.MessageID == gw.MessageID), 1)

            if (!this.toDelete.some(giveaway => giveaway?.MessageID == gw.MessageID)) this.toDelete.push(gw)

            const timeMs = (gw.DateNow + gw.TimeMs) - Date.now()
            if (timeMs <= -(1000 * 60 * 60 * 24 * 20)) // 20 Dias
                this.deleteGiveaway(gw)
            else setTimeout(() => this.deleteGiveaway(gw), (1000 * 60 * 60 * 24 * 20) - (timeMs - timeMs - timeMs))

            continue
        }
        return
    }

    async deleteGiveaway(giveaway) {
        if (!giveaway || !giveaway.MessageLink || !giveaway.MessageID) return
        const linkBreak = giveaway?.MessageLink?.split('/') || []

        if (!linkBreak || !linkBreak?.length)
            Database.deleteGiveaway(giveaway?.MessageID, giveaway?.GuildId)

        const channelId = linkBreak.at(-2)
        const message = await client.rest.get(Routes.channelMessage(channelId, giveaway.MessageID)).catch(() => null)
        const components = message?.components

        if (!message?.id || !components || !components.length)
            Database.deleteGiveaway(giveaway.MessageID, giveaway.GuildId)

        if (components && components[0]?.components[0]) {
            components[0].components[0].disabled = true
            components[0].components[1].disabled = true
        }

        const embed = message.embeds[0]
        if (!embed || !embed.length || !components[0]?.components[0])
            Database.deleteGiveaway(giveaway.MessageID, giveaway.GuildId)

        const field = embed.fields?.find(fild => fild?.name?.includes('Exclusão'))
        if (field) field.value = 'Tempo expirado (+20d)'

        Database.deleteGiveaway(giveaway.MessageID, giveaway.GuildId)
        return await client.rest.patch(Routes.channelMessage(channelId, giveaway.MessageID), {
            body: { components, embeds: [embed] }
        }).catch(() => { })
    }

    retry(giveaway) {
        this.retryCooldown[giveaway.MessageID] = (this.retryCooldown[giveaway.MessageID] || 0) + 5000
        return setTimeout(() => client.emit('giveaway', giveaway), this.retryCooldown[giveaway.MessageID])
    }

    pushParticipants(gwId, usersId = []) {
        const gw = this.getGiveaway(gwId)
        if (!gw) return
        gw.Participants = Array.from(new Set([...gw.Participants, ...usersId]))
    }

    removeParticipants(gwId, userId) {
        const gw = this.getGiveaway(gwId)
        if (!gw) return
        gw.Participants = gw.Participants.filter(id => id !== userId)
    }

    getGiveaway(gwId) {
        return [...this.giveaways, ...this.awaiting].find(g => g?.MessageID == gwId)
    }
}