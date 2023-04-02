import { Routes, time } from "discord.js"
import { Database, SaphireClient as client } from "../../../classes/index.js"
import { setTimeout as sleep } from 'node:timers/promises'
import { Emojis as e } from "../../../util/util.js"
import timeMs from "../../plugins/timeMs.js"

export default new class TwitchManager {
    constructor() {
        this.streamers = [] // ['alanzoka', 'cellbit', ...]
        this.data = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.channelsNotified = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.rolesIdMentions = {} // { 'alanzoka_channelId': roleId, 'cellbit_channelId': roleId, ... }
        this.customMessage = {} // { 'alanzoka_channelId': 'text...', 'cellbit_channelId': 'text...', ... }
        this.streamersOffline = [] // ['cellbit']
        this.streamersOnline = [] // ['alanzoka']
        this.requests = 0
        this.sendMessagesRequests = 0
    }

    async load() {

        const allData = await Database.Guild.find(
            { id: { $in: [...client.guilds.cache.keys()] } },
            'TwitchNotifications'
        )

        const formated = allData
            .filter(g => g.TwitchNotifications?.length)
            .map(g => g.TwitchNotifications)
            .flat()

        for (const data of formated) { // [..., { channelId: '123', streamer: 'alanzoka', roleId: '123' }, ...]
            if (!this.data[data.streamer]) this.data[data.streamer] = []

            const channel = await client.channels.fetch(data.channelId)
                .catch(err => {
                    // Unknown Channel
                    if (err.code == 10003) return this.deleteChannelFromTwitchNotification(data.channelId)
                    return null
                })

            if (channel) {
                if (!this.data[data.streamer].includes(data.channelId))
                    this.data[data.streamer].push(data.channelId)

                if (data.roleId)
                    this.rolesIdMentions[`${data.streamer}_${data.channelId}`] = data.roleId

                this.customMessage[`${data.streamer}_${data.channelId}`] = data.message
            }

            if (!this.streamers.includes(data.streamer))
                this.streamers.push(data.streamer)
        }

        await this.refreshStreamersCache()
        this.checkStreamersStatus()
        this.intervals()
        return
    }

    async checkStreamersStatus() {

        const availableStreamers = this.streamers.filter(streamer => this.data[streamer]?.length)

        if (availableStreamers.length)
            for (const streamer of availableStreamers)
                if (this.data[streamer]?.length) {
                    await this.isOnline(streamer)
                    await sleep(1000)
                    continue
                }

        setTimeout(() => this.checkStreamersStatus(), 5000)
        return
    }

    async switchStatus(streamer, status) {
        if (!status) return

        if (!isNaN(status) || status > 0) {
            if (this.data[streamer]?.length)
                this.notifyAllChannels(streamer, status)
            return
        }

        return
    }

    async isOnline(streamer) {
        if (!streamer) return

        const status = await this.checkIfStreamerIsOnline(streamer) // 'delete' | 'offline' | 'online'

        if (status > 0) {
            this.streamerIsOnline(streamer, status)
            return
        }

        switch (status) {
            case 'offline': this.streamerIsOffline(streamer); break;
            case 'delete': this.removeStreamer(streamer); break;
        }

        return
    }

    async streamerIsOffline(streamer) {

        if (this.streamersOnline.includes(streamer)) {
            await Database.Cache.General.pull('StreamersOnline', str => str == streamer)
            await Database.Cache.General.push('StreamersOffline', streamer)
            await Database.Cache.General.delete(`channelsNotified.${streamer}`)
            delete this.channelsNotified[streamer]
            if (!this.streamersOffline.includes(streamer)) this.streamersOffline.push(streamer)
            this.streamersOnline = this.streamersOnline.filter(str => str != streamer)
            return
        }

        if (!this.streamersOffline.includes(streamer)) {
            const usersOffline = await Database.Cache.General.get('StreamersOffline') || []
            if (!usersOffline.includes(streamer)) await Database.Cache.General.push('StreamersOffline', streamer)
            this.streamersOffline.push(streamer)
            return
        }

        return
    }

    async streamerIsOnline(streamer, status) {

        if (this.streamersOnline.includes(streamer))
            return this.switchStatus(streamer, status)
        else this.streamersOnline.push(streamer)

        if (this.streamersOffline.includes(streamer))
            this.streamersOffline = this.streamersOffline.filter(str => str != streamer)

        if (!(await Database.Cache.General.has('StreamersOnline', streamer)))
            await Database.Cache.General.push('StreamersOnline', streamer)

        await Database.Cache.General.pull('StreamersOffline', str => [streamer, null].includes(str))

        if (!this.data[streamer]?.length) return
        await this.notifyAllChannels(streamer, status)
        return
    }

    async notifyAllChannels(streamer, status) {
        if (!streamer) return

        const channelsId = this.data[streamer]
        if (!channelsId.length) return
        let initalIndex = 0

        const embed = await this.getEmbedData(streamer, status)

        for (let i = 30; initalIndex < channelsId.length; i += 30) {
            const channels = channelsId.slice(initalIndex, i)

            for (const channelId of channels) {

                if (this.channelsNotified[streamer]?.includes(channelId)) {
                    this.notificationSended(streamer, channelId)
                    continue
                }

                if (this.sendMessagesRequests > 30) {
                    await sleep(1000)
                    this.sendMessagesRequests = 0
                }

                let content = undefined
                let role = undefined

                if (this.rolesIdMentions[`${streamer}_${channelId}`] && !this.customMessage[`${streamer}_${channelId}`])
                    role = `<@&${this.rolesIdMentions[`${streamer}_${channelId}`]}>, ${embed.onlineText}`

                if (this.customMessage[`${streamer}_${channelId}`]?.length)
                    content = this.customMessage[`${streamer}_${channelId}`]

                await client.rest.post(Routes.channelMessages(channelId), {
                    body: {
                        content: content || role || `${e.Notification} | ${embed.onlineText}`,
                        embeds: [embed]
                    }
                })
                    .then(() => {
                        client.twitchNotifications++
                        this.notificationSended(streamer, channelId)
                    })
                    .catch(err => {
                        this.sendMessagesRequests++
                        // Unknown Channel
                        if (err.code == 10003) return this.deleteChannelFromTwitchNotification(channelId)
                        return
                    })
            }

            initalIndex += 30
            await sleep(1000)
            continue
        }

        return
    }

    async notificationSended(streamer, channelId) {
        this.sendMessagesRequests++
        if (!streamer) return
        if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []
        this.channelsNotified[streamer].push(channelId)
        await Database.Cache.General.push('StreamersOnline', streamer)
        await Database.Cache.General.push(`channelsNotified.${streamer}`, channelId)
        this.removeChannel(streamer, channelId)
        return
    }

    async fetcher(url) {
        // 100 Requests per minute
        if (this.requests >= 95)
            await sleep(1000 * 60)

        this.requests++
        return await fetch(url).catch(err => {
            console.log(err)
            return null
        })
    }

    async getEmbedData(streamer, status) {
        if (!streamer) return

        const avatar = await this.fetcher(`https://decapi.me/twitch/avatar/${streamer}`).then(async data => data.text()).catch(() => null)
        const title = await this.fetcher(`https://decapi.me/twitch/title/${streamer}`).then(async data => data.text()).catch(() => 'Título não encontrado')
        const game = await this.fetcher(`https://decapi.me/twitch/game/${streamer}`).then(async data => data.text()).catch(() => 'Jogo não encontrado')
        const imageUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamer}-620x378.png`

        const embed = {
            onlineText: `**${streamer}** está em live na Twitch.`,
            color: 0x9c44fb,
            title: title?.slice(0, 256) || 'Nenhum título foi definido',
            url: `https://www.twitch.tv/${streamer}`,
            thumbnail: { url: avatar || null },
            description: `📺 Transmitindo **${game || 'Nenhum jogo foi definido'}**\n⏱️ Está online ${time(new Date(Date.now() - status), 'R')}`,
            image: { url: imageUrl || null },
            footer: {
                text: `${client.user.username}'s Twitch Notification System`,
                icon_url: 'https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png',
            },
        }

        return embed
    }

    async checkIfStreamerIsOnline(streamer) {
        if (!streamer) return
        const data = await this.fetcher(`https://decapi.me/twitch/uptime/${streamer}`)
            .then(async res => {
                const resText = await res.text()
                if (resText.includes('Too Many Requests')) {
                    this.requests = 100
                    return null
                }
                return resText.includes('offline')
                    ? 'offline'
                    : timeMs(resText
                        .replace(' days', 'd')
                        .replace(' hours', 'h')
                        .replace(' minutes', 'm')
                        .replace(' seconds', 's')
                        .replace(',', '')
                    )
            })
            .catch(() => "delete")
        return data
    }

    async removeStreamer(streamer) {
        if (!streamer) return
        const channels = this.data[streamer] || []
        if (!channels.length) return

        const guildsId = []
        for (const channelId of channels) {
            const channel = await client.channels.fetch(channelId).catch(() => null)
            if (channel)
                if (!guildsId.includes(channel.guild.id))
                    guildsId.push(channel.guild.id)
            continue
        }

        if (guildsId.length)
            await Database.Guild.updateMany(
                { id: { $in: guildsId } },
                {
                    $pull: {
                        TwitchNotifications: { streamer: streamer }
                    }
                }
            )

        await sleep(500)
        return
    }

    async removeChannel(streamer, channelId) {
        if (!streamer) return

        if (this.data[streamer]?.includes(channelId))
            this.data[streamer] = this.data[streamer]?.filter(id => id != channelId)

        return
    }

    addChannelToStreamer(streamer, channelId) {
        if (!streamer) return
        if (!this.data[streamer]) this.data[streamer] = []
        this.data[streamer].push(channelId)
        return
    }

    async refreshStreamersCache() {
        const StreamersOnline = await Database.Cache.General.get('StreamersOnline') || []
        const StreamersOffline = await Database.Cache.General.get('StreamersOffline') || []
        this.streamersOnline = Array.from(new Set(StreamersOnline)).filter(i => i)
        this.streamersOffline = Array.from(new Set(StreamersOffline)).filter(i => i)
        await Database.Cache.General.set('StreamersOnline', this.streamersOnline) || []
        await Database.Cache.General.set('StreamersOffline', this.streamersOffline) || []

        const data = await Database.Cache.General.get('channelsNotified') || {}
        const streamers = Object.keys(data)

        if (streamers.length)
            for (const streamer of streamers)
                await Database.Cache.General.set(`channelsNotified.${streamer}`, Array.from(new Set(data[streamer])).filter(i => i))

        this.channelsNotified = await Database.Cache.General.get('channelsNotified') || {}
        return
    }

    intervals() {
        setInterval(() => this.sendMessagesRequests = 0, 1000 * 5)
        setInterval(() => this.refreshStreamersCache(), 1000 * 15)
        setInterval(() => this.requests = 0, 1000 * 60)
        return
    }

    async deleteChannelFromTwitchNotification(channelId) {

        for (const streamer of this.streamers) {
            this.data[streamer] = this.data[streamer]?.filter(id => id != channelId)
            this.channelsNotified[streamer] = this.channelsNotified[streamer]?.filter(id => id != channelId)
            await Database.Cache.General.pull(`channelsNotified.${streamer}`, cId => cId == channelId)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { [`TwitchStreamers.${this.streamers}`]: channelId } }
            )
        }

        await Database.Guild.updateMany(
            {},
            { $pull: { TwitchNotifications: { channelId: channelId } } }
        )

        return
    }

}