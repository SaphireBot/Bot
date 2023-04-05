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
        this.allGuildsID = [] // [..., '123', ...]
        this.toSendNotifications = [] // [..., { channelId: '123', content: 'adc', embeds: [...] }, ...]
        this.streamersOnChecking = 0
        this.requests = 0
        this.sendMessagesRequests = 0
        this.notifications = 0
        this.awaitingRequests = 0
        this.notificationInThisSeason = 0
    }

    async load() {

        await this.refreshStreamersCache()

        this.notifications = Array.from(new Set(Object.values(this.channelsNotified).flat())).length

        const allData = await Database.Guild.find(
            { id: { $in: [...client.guilds.cache.keys()] } },
            'id TwitchNotifications'
        )

        this.allGuildsID = allData.filter(g => g.TwitchNotifications?.length).map(g => g.id).filter(i => i)

        const formated = allData
            .filter(g => g.TwitchNotifications?.length)
            .map(g => g.TwitchNotifications)
            .flat()

        for (const data of formated) { // [..., { channelId: '123', streamer: 'alanzoka', roleId: '123' }, ...]
            if (!this.data[data.streamer]) this.data[data.streamer] = []
            if (!this.streamers.includes(data.streamer))
                this.streamers.push(data.streamer)

            await client.channels.fetch(data.channelId)
                .then(() => {
                    if (!this.data[data.streamer].includes(data.channelId))
                        this.data[data.streamer].push(data.channelId)

                    if (data.roleId)
                        this.rolesIdMentions[`${data.streamer}_${data.channelId}`] = data.roleId

                    this.customMessage[`${data.streamer}_${data.channelId}`] = data.message
                })
                .catch(err => {
                    // Unknown Channel
                    if (err.code == 10003) return this.deleteChannelFromTwitchNotification(data.channelId)
                    return null
                })

            continue
        }

        this.streamer = Array.from(new Set(this.streamer))
        this.checkStreamersStatus()
        this.intervals()
        this.sendNotification()
        return
    }

    async checkStreamersStatus() {

        if (this.streamersOnChecking < 1) {

            const availableStreamers = this.streamers
                .filter(streamer => this.data[streamer]?.length || this.channelsNotified[streamer]?.length)

            this.streamersOnChecking = availableStreamers.length

            if (this.streamersOnChecking > 0)
                for (const streamer of availableStreamers)
                    await this.isOnline(streamer)

            let timeToRepeat = 500 * availableStreamers.length
            if (timeToRepeat < 1000 * 3) timeToRepeat += 3000
            setTimeout(() => this.checkStreamersStatus(), timeToRepeat)
            return
        }

        setTimeout(() => this.checkStreamersStatus(), 1000 * 5)
        return
    }

    async switchStatus(streamer, status) {

        if (!isNaN(status) || status > 0)
            if (this.data[streamer]?.length) {
                this.notifyAllChannels(streamer, status)
                return
            }

        this.streamersOnChecking--
        return
    }

    async isOnline(streamer) {

        const status = await this.checkIfStreamerIsOnline(streamer) // 'delete' | 'offline' | 'online'

        if (!status) {
            this.streamersOnChecking--
            return
        }

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
            this.streamersOnline = this.streamersOnline.filter(str => str != streamer)
            await Database.Cache.General.pull('StreamersOnline', str => str == streamer)
            await Database.Cache.General.delete(`channelsNotified.${streamer}`)
            const channelsToNotifier = this.channelsNotified[streamer] || []
            this.channelsNotified[streamer] = []

            for (const channelId of channelsToNotifier)
                this.toSendNotifications.push({ streamer, channelId, embeds: [], content: `${e.Notification} | **${streamer}** não está mais online.`, isAfkNotification: true })
        }

        if (!this.streamersOffline.includes(streamer)) {
            await Database.Cache.General.push('StreamersOffline', streamer)
            this.streamersOffline.push(streamer)
        }

        this.streamersOnChecking--
        return
    }

    async streamerIsOnline(streamer, status) {

        if (this.streamersOnline.includes(streamer))
            return this.switchStatus(streamer, status)
        else this.streamersOnline.push(streamer)

        if (this.streamersOffline.includes(streamer))
            this.streamersOffline = this.streamersOffline.filter(str => str != streamer)

        await Database.Cache.General.push('StreamersOnline', streamer)
        await Database.Cache.General.pull('StreamersOffline', str => [streamer, null].includes(str))

        if (!this.data[streamer]?.length) {
            this.streamersOnChecking--
            return
        }

        await this.notifyAllChannels(streamer, status)
        return
    }

    async notifyAllChannels(streamer, status) {
        if (!streamer) {
            this.streamersOnChecking--
            return
        }

        const channelsId = this.data[streamer]
        if (!channelsId.length) {
            this.streamersOnChecking--
            return
        }

        const embed = await this.getEmbedData(streamer, status)

        for (const channelId of this.data[streamer]) {

            if (
                this.toSendNotifications
                    .some(data => data.streamer == streamer && data.channelId == channelId)
            )
                continue

            let content = undefined
            let role = undefined

            if (this.rolesIdMentions[`${streamer}_${channelId}`] && !this.customMessage[`${streamer}_${channelId}`])
                role = `<@&${this.rolesIdMentions[`${streamer}_${channelId}`]}>, ${embed.onlineText}`

            if (this.customMessage[`${streamer}_${channelId}`]?.length)
                content = this.customMessage[`${streamer}_${channelId}`]

            this.data[streamer].splice(
                this.data[streamer].findIndex(cId => cId == channelId), 1
            )

            this.toSendNotifications.push({
                channelId,
                streamer,
                content: content || role || `${e.Notification} | ${embed.onlineText}`,
                embeds: [embed]
            })
            continue
        }

        this.streamersOnChecking--
        return
    }

    async sendNotification() {

        const toSendData = this.toSendNotifications.slice(0, 30)

        if (toSendData.length) {
            for (const data of toSendData) {

                if (this.channelsNotified[data.streamer]?.includes(data.channelId))
                    continue

                client.rest.post(Routes.channelMessages(data.channelId), {
                    body: { content: data.content, embeds: data.embeds }
                })
                    .then(() => {
                        this.notifications++
                        this.notificationInThisSeason++
                        if (!data.isAfkNotification) this.notificationSended(data.streamer, data.channelId)
                        return
                    })
                    .catch(err => {
                        this.sendMessagesRequests++
                        // Unknown Channel - Missing Access
                        if ([50001, 100003].includes(err.code)) return this.deleteChannelFromTwitchNotification(data.channelId)
                        return
                    })
                continue;
            }

            this.toSendNotifications.splice(0, toSendData.length)
        }

        setTimeout(() => this.sendNotification(), 1000 * 2)
        return
    }

    async notificationSended(streamer, channelId) {
        this.sendMessagesRequests++
        if (!streamer) return
        if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []
        if (!this.channelsNotified[streamer].includes(channelId)) this.channelsNotified[streamer].push(channelId)
        await Database.Cache.General.push('StreamersOnline', streamer)
        await Database.Cache.General.push(`channelsNotified.${streamer}`, channelId)
        return
    }

    get fetchLimited() {
        return this.requests > 94
    }

    async fetcher(url) {
        // 100 Requests per minute
        this.requests++
        if (this.fetchLimited)
            return this.awaiting(url)

        return await fetch(url)
            .then(res => {

                if (res.status == 429) {
                    this.requests = 100
                    return this.awaiting(url)
                }

                return res
            })
            .catch(err => {
                console.log(err)
                return null
            })
    }

    awaiting(url) {
        this.awaitingRequests++
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (this.requests > 90) return
                clearInterval(interval)
                this.fetcher(url)
                this.awaitingRequests--
                return resolve()
            }, 1000)
        })
    }

    async getEmbedData(streamer, status) {
        if (!streamer) return

        const avatar = await this.fetcher(`https://decapi.me/twitch/avatar/${streamer}`).then(async data => await data.text()).catch(() => null)
        const title = await this.fetcher(`https://decapi.me/twitch/title/${streamer}`).then(async data => await data.text()).catch(() => 'Título não encontrado')
        const game = await this.fetcher(`https://decapi.me/twitch/game/${streamer}`).then(async data => await data.text()).catch(() => 'Jogo não encontrado')
        const viewers = await this.fetcher(`https://decapi.me/twitch/followcount/${streamer}`).then(async data => await data.text()).catch(() => 0)
        const imageUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamer}-620x378.png`
        const url = `https://www.twitch.tv/${streamer}`

        const embed = {
            onlineText: `**${streamer}** está em live na Twitch.`,
            color: 0x9c44fb,
            title: title?.slice(0, 256) || 'Nenhum título foi definido',
            author: {
                name: streamer || '??',
                icon_url: avatar || null,
                url,
            },
            url,
            thumbnail: { url: avatar || null },
            description: `📺 Transmitindo **${game || 'Nenhum jogo foi definido'}**\n⏱️ Está online ${time(new Date(Date.now() - status), 'R')}\n👥 ${Number(viewers).currency()} seguidores`,
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
                if (!res) return null
                const resText = await res.text()
                if (resText.includes('Malformed query params.'))
                    return 'delete'

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
            .catch(err => {
                console.log(err)
                return null
            })
        return data
    }

    async removeStreamer(streamer) {
        if (!streamer) {
            this.streamersOnChecking--
            return
        }

        delete this.data[streamer]
        delete this.channelsNotified[streamer]

        if (this.streamers.includes(streamer))
            this.streamers.splice(
                this.streamers.findIndex(str => str == streamer), 1
            )

        if (this.streamersOffline.includes(streamer))
            this.streamersOffline.splice(
                this.streamersOffline.findIndex(str => str == streamer), 1
            )

        if (this.streamersOnline.includes(streamer))
            this.streamersOnline.splice(
                this.streamersOnline.findIndex(str => str == streamer), 1
            )

        await Database.Guild.updateMany(
            { id: { $in: this.allGuildsID } },
            {
                $pull: {
                    TwitchNotifications: { streamer: streamer }
                }
            }
        )

        this.streamersOnChecking--
        return
    }

    async removeChannel(streamer, channelId) {
        if (!streamer || !channelId) return

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

        if (this.streamers.length)
            for (const streamer of this.streamers) {
                if (this.data[streamer]?.length) {
                    await Database.Cache.General.set(`channelsNotified.${streamer}`, Array.from(new Set(this.data[streamer])).filter(i => i))
                    this.data[streamer] = Array.from(new Set(this.data[streamer])).filter(i => i)
                }
            }

        this.channelsNotified = await Database.Cache.General.get('channelsNotified') || {}
        return
    }

    intervals() {
        setInterval(() => this.refreshStreamersCache(), 1000 * 10)
        setInterval(() => this.setCounter(), 1000 * 30)

        setInterval(() => this.sendMessagesRequests = 0, 1000 * 5)
        setInterval(() => this.requests = 0, 1000 * 60)
        return
    }

    async setCounter() {

        if (this.notificationInThisSeason > 0)
            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $inc: {
                        TwitchNotifications: this.notificationInThisSeason
                    }
                }
            )

        this.notificationInThisSeason = 0
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