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

    async setGiveaways(guildsData) {
        await client.guilds.fetch()
        const guildsId = [...client.guilds.cache.keys()]
        const giveawaysFromGuilds = guildsData.filter(gData => guildsId.includes(gData.id))
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
            }
            continue
        }

        return setTimeout(() => this.checkBits(), 600000)
    }

    async managerUnavailablesGiveaways(giveaways = []) {
        if (!giveaways.length) return
        const deleteGiveaway = this.deleteGiveaway

        for await (const gw of giveaways) {

            if (this.giveaways.some(giveaway => giveaway?.MessageID == gw.MessageID))
                this.giveaways.splice(this.giveaways.findIndex(giveaway => giveaway?.MessageID == gw.MessageID), 1)

            if (this.awaiting.some(giveaway => giveaway?.MessageID == gw.MessageID))
                this.awaiting.splice(this.awaiting.findIndex(giveaway => giveaway?.MessageID == gw.MessageID), 1)

            if (!this.toDelete.some(giveaway => giveaway?.MessageID == gw.MessageID)) this.toDelete.push(gw)

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

    getGiveaway(gwId, channelId) {
        const gws = [...this.giveaways, ...this.awaiting, ...this.toDelete]

        if (channelId) {
            const exist = gws.some(g => g?.ChannelId == channelId)
            return exist
        }

        const gw = gws.find(g => g?.MessageID == gwId)
        return gw
    }
}