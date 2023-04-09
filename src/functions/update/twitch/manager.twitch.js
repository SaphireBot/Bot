import { time } from "discord.js"
import { Database, SaphireClient as client } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"
import { TwitchLanguages } from "../../../util/Constants.js"

export default new class TwitchManager {
    constructor() {
        this.streamers = [] // ['alanzoka', 'cellbit', ...]
        this.toCheckStreamers = [] // ['alanzoka', 'cellbit', ...]
        this.data = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.channelsNotified = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.rolesIdMentions = {} // { 'alanzoka_channelId': roleId, 'cellbit_channelId': roleId, ... }
        this.customMessage = {} // { 'alanzoka_channelId': 'text...', 'cellbit_channelId': 'text...', ... }
        this.streamersOffline = [] // ['cellbit']
        this.streamersOnline = [] // ['alanzoka']
        this.allGuildsID = [] // [..., '123', ...]
        this.requests = 0
        this.sendMessagesRequests = 0
        this.notifications = 0
        this.awaitingRequests = 0
        this.notificationInThisSeason = 0
    }

    async load() {

        await this.refreshStreamersCache()
        this.notifications = Array.from(new Set(Object.values(this.channelsNotified).flat())).length

        const allData = await Database.Guild.find({}, 'id TwitchNotifications')

        this.allGuildsID = allData.filter(g => g.TwitchNotifications?.length).map(g => g.id).filter(i => i)

        const formated = allData
            .filter(g => g.TwitchNotifications?.length)
            .map(g => g.TwitchNotifications)
            .flat()

        for (const data of formated) { // [..., { channelId: '123', streamer: 'alanzoka', roleId: '123' }, ...]
            if (!this.data[data.streamer]) this.data[data.streamer] = []
            if (!this.streamers.includes(data.streamer)) {
                this.streamers.push(data.streamer)
                this.toCheckStreamers.push(data.streamer)
            }

            if (
                !this.streamersOffline.includes(data.streamer)
                && !this.streamersOnline.includes(data.streamer)
            ) this.streamersOffline.push(data.streamer)

            this.data[data.streamer] = this.data[data.streamer].filter(channelId => !this.channelsNotified[data.streamer]?.includes(channelId))
            await client.channels.fetch(data.channelId)
                .then(() => {
                    if (!this.data[data.streamer].includes(data.channelId))
                        this.data[data.streamer].push(data.channelId)

                    if (data.roleId)
                        this.rolesIdMentions[`${data.streamer}_${data.channelId}`] = data.roleId

                    this.customMessage[`${data.streamer}_${data.channelId}`] = data.message
                })
                .catch(err => {
                    // Unknown Channel - Missing Permissions
                    if ([50001, 100003].includes(err.code)) return this.deleteChannelFromTwitchNotification(data.channelId)
                    return null
                })

            continue
        }

        this.streamers = Array.from(new Set(this.streamers)).map(streamer => streamer.toLowerCase()).filter(i => i)
        this.checkStreamersStatus()
        this.intervals()
        return
    }

    async checkStreamersStatus() {

        const streamers = this.toCheckStreamers.slice(0, 100)

        if (!streamers.length) {
            this.toCheckStreamers = this.streamers
            return setTimeout(() => this.checkStreamersStatus(), 1000 * 2)
        }

        const streamersStatus = await this.fetcher(`https://api.twitch.tv/helix/streams?${streamers.map(str => `user_login=${str}`).join('&')}`)

        if (streamersStatus.length) {

            const streamersOffline = this.streamers
                .filter(
                    streamer => !streamersStatus.some(data => data?.user_login == streamer)
                )
            this.offlineStreamers(streamersOffline)

            const streamersOnline = streamersStatus.filter(data => this.data[data?.user_login]?.length)
            if (streamersOnline.length) this.onlineStreamers(streamersOnline)
        }

        streamers.splice(0, streamers.length)
        setTimeout(() => this.checkStreamersStatus(), 1000 * 5)
        return
    }

    async offlineStreamers(streamers = []) {
        if (!streamers.length) return

        for (const streamer of streamers) {

            if (this.streamersOnline.includes(streamer) || this.channelsNotified[streamer]?.length > 0)
                this.notifyAndSetOfflineStreamer(streamer)

            if (!this.streamersOffline.includes(streamer)) {
                await Database.Cache.General.push('StreamersOffline', streamer)
                this.streamersOffline.push(streamer)
            }

            continue
        }

        return
    }

    async notifyAndSetOfflineStreamer(streamer) {
        const index = this.streamersOnline.findIndex(str => str == streamer)
        if (index >= 0) this.streamersOnline.splice(index, 1)
        await Database.Cache.General.pull('StreamersOnline', str => str == streamer)
        await Database.Cache.General.set(`channelsNotified.${streamer}`, [])
        const channelsToNotifier = this.channelsNotified[streamer] || []
        this.channelsNotified[streamer] = []
        if (channelsToNotifier.length) this.notifyOfflineStreamersChannels(streamer, channelsToNotifier)
        return
    }

    async fetcher(url) {
        const data = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
                "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
            }
        })
            .then(async res => await res.json().then(r => r.data))
            .catch(console.log)

        return data
    }

    async notifyOfflineStreamersChannels(streamer, channels) {

        const request = await this.fetcher(`https://api.twitch.tv/helix/users?login=${streamer}`) || []
        const data = request[0]
        const twitchUrl = `https://www.twitch.tv/${streamer}`

        const offlineImage = data?.offline_image_url || null
        for (const channelId of channels) {
            client.postMessage({
                channelId,
                content: offlineImage ? null : `${e.Notification} | **${streamer}** não está mais online.`,
                embeds: offlineImage
                    ? [{
                        color: 0x9c44fb, /* Twitch's Logo Purple */
                        author: {
                            name: data.display_name || streamer,
                            icon_url: data.profile_image_url || null,
                            url: twitchUrl
                        },
                        description: `[**${data.display_name}**](${twitchUrl}) não está mais online.`,
                        image: { url: offlineImage },
                        footer: {
                            text: `${client.user.username}'s Twitch Notification System`,
                            icon_url: 'https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png',
                        }
                    }]
                    : []
            })
            this.sendMessagesRequests++
        }
    }

    async onlineStreamers(streamers) {
        const streamersData = await this.fetcher(`https://api.twitch.tv/helix/users?${streamers.map(data => `login=${data.user_login}`).join('&')}`) || []
        if (!streamersData.length) return

        for (const streamerData of streamers) {

            const streamer = streamerData?.user_login

            this.streamersOffline = this.streamersOffline.filter(str => str != streamer)
            Database.Cache.General.push('StreamersOnline', streamer)
            Database.Cache.General.set('StreamersOffline', this.streamersOffline)

            if (!this.streamersOnline.includes(streamer))
                this.streamersOnline.push(streamer)

            if (this.data[streamer]?.length)
                return this.notifyAllChannels(streamerData, streamersData)

        }
        return
    }

    notifyAllChannels(data, streamersData) {

        const streamer = data?.user_login
        const streamerData = streamersData?.find(data => data?.login == streamer)

        if (!streamer || !data) return

        const channelsId = this.data[streamer] || []
        if (!channelsId.length) return

        const messageDefault = `**${streamer}** está em live na Twitch.`
        let alreadySended = []
        if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []
        this.data[streamer] = this.data[streamer].filter(cId => !this.channelsNotified[streamer]?.includes(cId))

        const game = data.game_name ? `${data.game_name} \`${data.game_id}\`` : 'Nenhum jogo foi definido'
        const avatar = streamerData?.profile_image_url || null
        const viewers = `\`${data.viewer_count?.currency() || 0}\``
        const imageUrl = data.thumbnail_url?.replace('{width}x{height}', '620x378') || null
        const url = `https://www.twitch.tv/${streamer}`
        const date = new Date(data.started_at)

        for (const channelId of this.data[streamer]) {

            if (
                alreadySended.includes(channelId)
                || this.channelsNotified[streamer].includes(channelId)
            ) continue
            alreadySended.push(channelId)

            let content = undefined
            let role = undefined

            if (this.rolesIdMentions[`${streamer}_${channelId}`] && !this.customMessage[`${streamer}_${channelId}`])
                role = `<@&${this.rolesIdMentions[`${streamer}_${channelId}`]}>, ${messageDefault}`

            if (this.customMessage[`${streamer}_${channelId}`]?.length)
                content = this.customMessage[`${streamer}_${channelId}`]

            this.notifications++
            this.notificationInThisSeason++
            this.sendMessagesRequests++
            this.cacheSave(streamer, channelId)
            this.channelsNotified[streamer].push(channelId)

            const channelIndex = this.data[streamer]?.findIndex(str => str == channelId)
            if (channelIndex >= 0) this.data[streamer]?.splice(channelIndex, 1)

            client.postMessage({
                channelId: channelId,
                content: content || role || `${e.Notification} | ${messageDefault}`,
                embeds: [{
                    color: 0x9c44fb, // Twitch's Logo Purple
                    title: data.title?.slice(0, 256) || 'Nenhum título foi definido',
                    author: {
                        name: data.user_name || '??',
                        icon_url: avatar || null,
                        url,
                    },
                    url,
                    thumbnail: { url: avatar || null },
                    description: `📺 Transmitindo **${game}**\n👥 ${viewers} pessoas assistindo agora`,
                    fields: [
                        {
                            name: '📝 Adicional',
                            value: `⏳ Está online ${time(date, 'R')}\n🗓️ Iniciou a live: ${Date.complete(data.started_at)}\n⏱️ Demorei \`${Date.stringDate(Date.now() - date?.valueOf())}\` para enviar esta notificação\n🏷️ Tags: ${data.tags?.map(tag => `\`${tag}\``)?.join(', ') || 'Nenhuma tag'}\n🔞 +18: ${data?.is_mature ? 'Sim' : 'Não'}\n💬 Idioma: ${TwitchLanguages[data?.language] || 'Indefinido'}`
                        }
                    ],
                    image: { url: imageUrl || null },
                    footer: {
                        text: `${client.user.username}'s Twitch Notification System`,
                        icon_url: 'https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png',
                    }
                }]
            })
            continue
        }

        return
    }

    async cacheSave(streamer, channelId) {
        if (!streamer || !channelId) return
        Database.Cache.General.push('StreamersOnline', streamer)
        Database.Cache.General.push(`channelsNotified.${streamer}`, channelId)
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
        const channelsNotified = await Database.Cache.General.get('channelsNotified') || {}
        this.streamersOnline = Array.from(new Set(StreamersOnline)).filter(i => i)
        this.streamersOffline = Array.from(new Set(StreamersOffline)).filter(i => i)
        for (let streamer of this.streamers) {
            if (!channelsNotified[streamer]) channelsNotified[streamer] = []
            channelsNotified[streamer] = Array.from(new Set(channelsNotified[streamer])).filter(i => i)
        }
        this.channelsNotified = channelsNotified

        await Database.Cache.General.set('channelsNotified', this.channelsNotified)
        await Database.Cache.General.set('StreamersOnline', this.streamersOnline)
        await Database.Cache.General.set('StreamersOffline', this.streamersOffline)
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
            Database.Client.updateOne(
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

    deleteChannelFromTwitchNotification(channelId) {

        for (const streamer of this.streamers) {
            this.data[streamer] = this.data[streamer]?.filter(id => id != channelId)
            this.channelsNotified[streamer] = this.channelsNotified[streamer]?.filter(id => id != channelId)
            Database.Cache.General.pull(`channelsNotified.${streamer}`, cId => cId == channelId)

            Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { [`TwitchStreamers.${this.streamers}`]: channelId } }
            )
        }

        Database.Guild.updateMany(
            {},
            { $pull: { TwitchNotifications: { channelId: channelId } } }
        )

        return
    }

}