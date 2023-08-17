import { SaphireClient as client, Database } from '../../../classes/index.js'
import { Routes } from 'discord.js'

export default new class GiveawayManager {
    constructor() {
        this.giveaways = {}
        this.awaiting = {}
        this.toDelete = {}
        this.onCheck = []
        this.retryCooldown = {}
    }

    async setGiveaways(guildsData) {

        if (!guildsData || !guildsData.length) return

        this
            .filterAndManager(
                guildsData
                    .filter(data => data.Giveaways?.length > 0 && client.guilds.cache.has(data?.id))
                    .map(data => data.Giveaways)
                    .flat()
                    .filter(i => i)
            )
        return
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
                this.awaiting[gw.MessageID] = gw
                continue
            }

            if (timeMs <= 1000) {
                this.giveaways[gw.MessageID] = gw
                client.emit('giveaway', gw)
                continue
            }

            const timeout = setTimeout(() => client.emit('giveaway', gw), timeMs)
            gw.timeout = timeout
            this.giveaways[gw.MessageID] = gw
            continue
        }

        if (this.onCheck) this.checkBits()
        return
    }

    checkBits() {
        this.onCheck = true
        const giveaways = Object.values(this.awaiting) || []

        if (!giveaways.length)
            return this.onCheck = false

        for (let gw of giveaways) {
            const time = (gw.DateNow + gw.TimeMs) - Date.now()
            if (time < 2147483647) {
                this.selectGiveaways([gw])
                delete this.awaiting[gwId]
                continue
            }
            continue
        }

        return setTimeout(() => this.checkBits(), 1000 * 60 * 60)
    }

    async managerUnavailablesGiveaways(giveaways = []) {
        if (!giveaways.length) return
        const deleteGiveaway = this.deleteGiveaway

        for await (const gw of giveaways) {

            if (this.giveaways[gw?.MessageID]) delete this.giveaways[gw?.MessageID]
            if (this.awaiting[gw?.MessageID]) delete this.awaiting[gw?.MessageID]
            if (!this.toDelete[gw?.MessageID]) this.toDelete[gw?.MessageID] = gw

            setUnavailable(gw)
            continue
        }

        async function setUnavailable(giveaway) {
            const twentyDays = 1000 * 60 * 60 * 24 * 20
            const timeMs = (giveaway.DateNow + giveaway.TimeMs) - Date.now()
            const theMessageStillExist = await client.rest.get(Routes.channelMessage(giveaway.ChannelId, giveaway.MessageID)).catch(() => null)
            if (!theMessageStillExist?.id) return Database.deleteGiveaway(giveaway.MessageID, giveaway.GuildId)
            if (timeMs <= -twentyDays) return deleteGiveaway(giveaway) // 20 Dias
            return setTimeout(() => deleteGiveaway(giveaway), twentyDays - (timeMs - timeMs - timeMs))
        }

        return
    }

    async deleteGiveaway(giveaway) {
        if (!giveaway || !giveaway.MessageLink || !giveaway.MessageID) return
        const linkBreak = giveaway?.MessageLink?.split('/') || []

        if (!linkBreak || !linkBreak?.length)
            return Database.deleteGiveaway(giveaway?.MessageID, giveaway?.GuildId)

        const channelId = linkBreak.at(-2)
        const message = await client.rest.get(Routes.channelMessage(channelId, giveaway.MessageID)).catch(() => null)
        const components = message?.components

        if (!message?.id || !components || !components.length)
            return Database.deleteGiveaway(giveaway.MessageID, giveaway.GuildId)

        if (components && components[0]?.components[0]) {
            components[0].components[0].disabled = true
            components[0].components[1].disabled = true
        }

        const embed = message?.embeds[0]
        if (!embed || !embed.length || !components[0]?.components[0])
            return Database.deleteGiveaway(giveaway.MessageID, giveaway.GuildId)

        const field = embed.fields?.find(fild => fild?.name?.includes('Exclusão'))
        if (field) field.value = 'Tempo expirado (+20d)'

        Database.deleteGiveaway(giveaway.MessageID, giveaway.GuildId)
        return await client.rest.patch(
            Routes.channelMessage(channelId, giveaway.MessageID),
            { body: { components, embeds: [embed] } }
        ).catch(() => { })
    }

    retry(giveaway) {
        this.retryCooldown[giveaway.MessageID] = (this.retryCooldown[giveaway.MessageID] || 0) + 5000
        return setTimeout(() => client.emit('giveaway', giveaway), this.retryCooldown[giveaway.MessageID])
    }

    pushParticipants(gwId, usersId = []) {
        const gw = this.getGiveaway(gwId)
        if (!gw) return
        gw.Participants = Array.from(new Set([...gw.Participants, ...usersId]))
        return
    }

    removeParticipants(gwId, userId) {
        const gw = this.getGiveaway(gwId)
        if (!gw) return
        gw.Participants.splice(gw.Participants.indexOf(userId), 1)
        return
    }

    getGiveaway(gwId, channelId) {

        if (gwId)
            return this.giveaways[gwId] || this.awaiting[gwId] || this.toDelete[gwId]

        if (!channelId) return
        return [
            ...Object.values(this.giveaways),
            ...Object.values(this.awaiting),
            ...Object.values(this.toDelete)
        ].filter(gw => gw?.ChannelId == channelId)
    }

    async fetchGiveaway(guildId, giveawayId) {
        if (!guildId || !giveawayId) return null
        const guildData = await Database.getGuild(guildId)
        if (!guildData) return null
        return guildData.Giveaways?.find(gw => gw?.MessageID == giveawayId)
    }
}