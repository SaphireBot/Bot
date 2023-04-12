import { ButtonStyle, parseEmoji, time } from "discord.js"
import { Database, SaphireClient as client } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"
import { TwitchLanguages } from "../../../util/Constants.js"

export default new class TwitchManager {
    constructor() {
        this.streamers = [] // ['alanzoka', 'cellbit', ...]
        this.toCheckStreamers = [] // ['alanzoka', 'cellbit', ...]
        this.data = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.tempCache = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.channelsNotified = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.rolesIdMentions = {} // { 'alanzoka_channelId': roleId, 'cellbit_channelId': roleId, ... }
        this.customMessage = {} // { 'alanzoka_channelId': 'text...', 'cellbit_channelId': 'text...', ... }
        this.streamersOffline = [] // ['cellbit']
        this.streamersOnline = [] // ['alanzoka']
        this.notifications = 0
        this.allGuildsID = 0
        this.awaitingRequests = 0
        this.notificationInThisSeason = 0
    }

    async checkAccessTokenAndStartLoading() {

        const clientData = await Database.Client.findOne({ id: client.user.id })
        client.TwitchAccessToken = clientData?.TwitchAccessToken
        if (!client.TwitchAccessToken) return this.renewToken()

        // https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
        return await fetch(
            'https://id.twitch.tv/oauth2/validate',
            {
                method: 'GET',
                headers: { Authorization: `OAuth ${client.TwitchAccessToken}`, }
            }
        )
            .then(res => res.json())
            .then(data => {

                if (
                    data.status == 401
                    || data.message == "invalid access token"
                    || data.expires_in < 86400 // 24hrs in seconds
                )
                    return this.renewToken()

                return this.load()
            })
            .catch(console.log)

    }

    async renewToken() {
        // https://dev.twitch.tv/docs/api/get-started/
        return await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
            .then(res => res.json())
            .then(async data => {
                return await Database.Client.updateOne(
                    { id: client.user.id },
                    { $set: { TwitchAccessToken: data.access_token } }
                )
                    .then(() => {
                        client.TwitchAccessToken = data.access_token
                        return this.load()
                    })
                    .catch(console.log)
            })
            .catch(console.log)
    }

    async load() {

        await this.refreshStreamersCache()
        this.notifications = Array.from(new Set(Object.values(this.channelsNotified).flat())).flat().length

        const allData = await Database.Guild.find({ TwitchNotifications: { $exists: true } }, 'id TwitchNotifications')
        this.allGuildsID = allData.filter(g => g.TwitchNotifications?.length).map(g => g.id).filter(i => i)

        const formated = allData
            .filter(g => g.TwitchNotifications?.length)
            .map(g => g.TwitchNotifications)
            .flat()

        let channels = Array.from(client.channels.cache.keys())
        let uncachedChannels = []

        for (const data of formated) { // [..., { channelId: '123', streamer: 'alanzoka', roleId: '123' }, ...]
            if (!this.data[data.streamer]) this.data[data.streamer] = []
            if (!this.channelsNotified[data.streamer]) this.channelsNotified[data.streamer] = []
            if (!this.streamers.includes(data.streamer)) {
                this.streamers.push(data.streamer)
                this.toCheckStreamers.push(data.streamer)
            }

            if (channels.includes(data.channelId)) {
                if (![
                    ...this.data[data.streamer],
                    ...this.channelsNotified[data.streamer]
                ].includes(data.channelId))
                    this.data[data.streamer].push(data.channelId)

                if (data.roleId)
                    this.rolesIdMentions[`${data.streamer}_${data.channelId}`] = data.roleId

                this.customMessage[`${data.streamer}_${data.channelId}`] = data.message
            } else uncachedChannels.push(data.channelId)

            continue
        }

        const remainingData = formated.filter(d => !channels.includes(d.channelId))

        if (remainingData.length)
            for await (const data of formated)
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

        this.streamers = Array.from(new Set(this.streamers)).flat().filter(i => i).map(streamer => streamer.toLowerCase())
        channels = []
        uncachedChannels = []
        const offlinesCached = this.streamers.filter(streamer => !this.streamersOnline.includes(streamer))
        if (offlinesCached.length) this.streamersOffline.push(...offlinesCached)
        if (this.streamersOffline.length)
            await Database.Cache.General.set('StreamersOffline', this.streamersOffline)
        this.checkStreamersStatus()
        this.saveChannelsNotified()
        return
    }

    async checkStreamersStatus() {

        let streamers = this.toCheckStreamers.slice(0, 100)

        if (!streamers.length) {
            this.toCheckStreamers = this.streamers
            streamers = this.toCheckStreamers.slice(0, 100)
        }

        if (streamers?.length) {

            const streamersStatus = await this.fetcher(`https://api.twitch.tv/helix/streams?${streamers.map(str => `user_login=${str}`).join('&')}`)
            if (streamersStatus.length) {
                this.offlineStreamers(
                    this.streamers
                        .filter(streamer => !streamersStatus.some(data => data?.user_login == streamer))
                )

                this.onlineStreamers(streamersStatus.filter(data => this.data[data?.user_login]?.length))
            }

        }

        streamers.splice(0, streamers.length)
        setTimeout(() => this.checkStreamersStatus(), 1000 * 5)
        return
    }

    async updateStreamer({ streamer, guildId, channelId }) {
        if (!streamer || !guildId || !channelId) return
        const dataFromDatabase = await Database.Guild.findOne({ id: guildId }) // [{ streamer: 'alanzoka', channelId: '123' }]
        let notifications = dataFromDatabase?.TwitchNotifications || []
        const oldChannelId = notifications.find(d => d.channelId == channelId)?.channelId
        const data = notifications
            .filter(d => d.streamer != streamer || (d.channelId == oldChannelId && d.streamer == streamer))

        data.push({ streamer, channelId })

        await Database.Guild.updateOne(
            { id: guildId },
            { $set: { TwitchNotifications: data } }
        )

        this.toCheckStreamers.push(streamer)
        if (!this.streamers.includes(streamer)) this.streamers.push(streamer)
        if (!this.data[streamer]) this.data[streamer] = []
        if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []

        const indexData = this.data[streamer].findIndex(cId => cId == oldChannelId)
        if (indexData < 0) this.data[streamer].push(channelId)
        else this.data[streamer].splice(indexData, 1, channelId)

        const indexNotified = this.channelsNotified[streamer].findIndex(cId => cId == oldChannelId)
        if (indexNotified >= 0) this.channelsNotified[streamer].splice(indexNotified, 1)
        await Database.Cache.General.set(`channelsNotified.${streamer}`, this.channelsNotified[streamer])

        return
    }

    async offlineStreamers(streamers = []) {
        if (!streamers.length) return

        const cached = await Database.Cache.General.get('StreamersOffline')

        const offlines = Array.from(
            new Set([...cached, ...streamers].flat())
        ).filter(i => i)

        this.streamersOffline = offlines
        await Database.Cache.General.set('StreamersOffline', this.streamersOffline)

        if (
            streamers.some(
                streamer => this.streamersOnline.includes(streamer)
                    || this.channelsNotified[streamer]?.length > 0
            )
        ) this.notifyAndSetOfflineStreamer(streamers)

        return
    }

    async notifyAndSetOfflineStreamer(streamers = []) {

        this.streamersOnline = Array.from(
            new Set(
                await Database.Cache.General.pull('StreamersOnline', str => [...streamers, null].includes(str))
            )
        ).flat().filter(i => i)

        await Database.Cache.General.push('StreamersOnline', ...streamers)
        const notifiedChannels = await Database.Cache.General.get('channelsNotified') || {}
        const streamersToNotifier = []

        for (const streamer of streamers)
            if (this.channelsNotified[streamer]?.length) {
                this.data[streamer].push(...this.channelsNotified[streamer])
                notifiedChannels[streamer] = []
                streamersToNotifier.push({ streamer, channels: Array.from(new Set(this.channelsNotified[streamer])).filter(i => i) })
                this.channelsNotified[streamer] = []
                continue
            }

        if (streamersToNotifier.length) this.notifyOfflineStreamersChannels(streamersToNotifier)
        await Database.Cache.General.set('channelsNotified', notifiedChannels)
        return
    }

    async fetcher(url) {
        const data = new Promise((resolve) => {

            const timeout = setTimeout(() => resolve([]), 2000)

            fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${client.TwitchAccessToken}`,
                    "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
                }
            })
                .then(res => {
                    clearTimeout(timeout)
                    return res.json()
                })
                .then(res => {
                    if (res.status == 401 || res.message == "invalid access token") {
                        this.renewToken()
                        return resolve([])
                    }
                    return resolve(res.data || [])
                })
                .catch(err => {
                    clearTimeout(timeout)
                    console.log('TWITCH MANAGER FETCH ERROR', err)
                    return resolve([])
                })
        })

        return data
    }

    async getFollowers(broadcaster_id) {
        if (!broadcaster_id) return
        const data = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcaster_id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
                "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
            }
        })
            .then(res => res.json())
            .then(r => r.total || 0)
            .catch(err => {
                console.log(err)
                return
            })
        return data
    }

    async notifyOfflineStreamersChannels(offlineStreamers) {

        const request = await this.fetcher(`https://api.twitch.tv/helix/users?${offlineStreamers.map(d => `login=${d.streamer}`).join('&')}`)

        if (request.length)
            for (const { streamer, channels } of offlineStreamers) {

                const data = request.find(res => res.login == streamer)
                const offlineImage = data?.offline_image_url || null

                for (const channelId of channels)
                    client.pushMessage({
                        method: 'post',
                        channelId,
                        isTwitchNotification: true,
                        body: {
                            content: offlineImage ? null : `${e.Notification} | **${streamer}** não está mais online.`,
                            embeds: offlineImage
                                ? [{
                                    color: 0x9c44fb, /* Twitch's Logo Purple */
                                    author: {
                                        name: `${data.display_name || streamer} não está mais online.`,
                                        icon_url: data.profile_image_url || null,
                                        url: `https://www.twitch.tv/${streamer}`
                                    },
                                    image: { url: offlineImage },
                                    footer: {
                                        text: `${client.user.username}'s Twitch Notification System`,
                                        icon_url: 'https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png',
                                    }
                                }]
                                : [],
                            components: [{
                                type: 1,
                                components: [{
                                    type: 2,
                                    label: 'Ver as Últimas 25 Lives',
                                    emoji: parseEmoji('🎬'),
                                    custom_id: JSON.stringify({ c: 'twitch', src: 'oldLive', streamerId: data.id }),
                                    style: ButtonStyle.Primary
                                }]
                            }]
                        }
                    })

            }
        return
    }

    async onlineStreamers(streamersStatus) {
        const streamersData = await this.fetcher(`https://api.twitch.tv/helix/users?${streamersStatus.map(data => `login=${data.user_login}`).join('&')}`)
        if (!streamersData.length) return

        const oldOfflineMembers = await Database.Cache.General.pull('StreamersOffline', str => streamersStatus.some(d => d.user_login == str))
        this.streamersOffline = oldOfflineMembers
        const onlineMembers = Array.from(new Set([...this.streamersOnline, ...streamersStatus.map(d => d.user_login)].flat())).filter(i => i)
        await Database.Cache.General.set('StreamersOnline', onlineMembers)
        this.streamersOnline = onlineMembers

        for (const data of streamersStatus) {
            const streamerData = streamersData?.find(d => d?.login == data.user_login)
            data.avatar = streamerData?.profile_image_url || null
            data.display_name = streamerData?.display_name || null
            this.notifyAllChannels(data)
            continue
        }
        return
    }

    notifyAllChannels(data) {

        const streamer = data?.user_login
        const channelsId = this.data[streamer] || []
        if (!data || !streamer || !channelsId.length) return

        if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []
        this.data[streamer] = this.data[streamer].filter(cId => !this.channelsNotified[streamer]?.includes(cId))
        this.channelsNotified[streamer]?.push(...this.data[streamer])

        const game = data.game_name ? `${data.game_name} \`${data.game_id}\`` : 'Nenhum jogo foi definido'
        const avatar = data.avatar || null
        const viewers = `\`${data.viewer_count?.currency() || 0}\``
        const imageUrl = data.thumbnail_url?.replace('{width}x{height}', '620x378') || null
        const url = `https://www.twitch.tv/${streamer}`
        const messageDefault = `**${data.display_name}** está em live na Twitch.`
        const date = new Date(data.started_at)
        let alreadySended = []
        if (!this.tempCache[streamer]) this.tempCache[streamer] = []

        for (const channelId of this.data[streamer]) {

            if (alreadySended.includes(channelId)) continue
            alreadySended.push(channelId)

            let content = undefined
            let role = undefined

            if (this.rolesIdMentions[`${streamer}_${channelId}`] && !this.customMessage[`${streamer}_${channelId}`])
                role = `<@&${this.rolesIdMentions[`${streamer}_${channelId}`]}>, ${messageDefault}`

            if (this.customMessage[`${streamer}_${channelId}`]?.length)
                content = this.customMessage[`${streamer}_${channelId}`]

            this.notifications++
            this.notificationInThisSeason++

            client.pushMessage({
                method: 'post',
                isTwitchNotification: true,
                channelId,
                body: {
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
                    }],
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            label: 'Liberar Clips',
                            emoji: parseEmoji('🔒'),
                            custom_id: JSON.stringify({ c: 'twitch', src: 'clips', streamerId: data.user_id }),
                            style: ButtonStyle.Primary
                        }]
                    }]
                }
            })
            continue
        }

        this.data[streamer] = this.data[streamer].filter(cId => !alreadySended.includes(cId)) || []
        this.tempCache[streamer] = Array.from(new Set([...alreadySended, ...this.channelsNotified[streamer]]))
        return
    }

    async saveChannelsNotified(initial = false) {

        if (initial)
            for await (const streamer of this.streamers) {
                const data = this.tempCache[streamer] || []
                if (data.length) {
                    delete this.tempCache[streamer]
                    await Database.Cache.General.set(`channelsNotified.${streamer}`, data)
                    continue
                }
            }

        setTimeout(() => this.saveChannelsNotified(true), 1000 * 10)
        return
    }

    async removeChannel(streamer, channelId) {
        if (!streamer || !channelId) return

        if (this.data[streamer]?.includes(channelId))
            this.data[streamer] = this.data[streamer]?.filter(id => id != channelId)

        if (this.channelsNotified[streamer]?.includes(channelId))
            this.channelsNotified[streamer] = this.channelsNotified[streamer]?.filter(id => id != channelId)

        return
    }

    async refreshStreamersCache(inital = true) {
        const StreamersOnline = this.streamersOnline.length
            ? await Database.Cache.General.push('StreamersOnline', ...this.streamersOnline) || []
            : await Database.Cache.General.get('StreamersOnline') || []

        const StreamersOffline = this.streamersOffline.length
            ? await Database.Cache.General.push('StreamersOffline', ...this.streamersOffline) || []
            : await Database.Cache.General.get('StreamersOffline') || []

        this.streamersOnline = Array.from(new Set(StreamersOnline)).filter(i => i).flat()
        this.streamersOffline = Array.from(new Set(StreamersOffline)).filter(i => i).flat()

        if (inital) {
            const channelsNotified = await Database.Cache.General.get('channelsNotified') || {}
            for (let streamer of this.streamers) {
                if (!channelsNotified[streamer]) channelsNotified[streamer] = []
                if (channelsNotified[streamer].length)
                    channelsNotified[streamer] = Array.from(new Set(channelsNotified[streamer])).flat().filter(i => i)
            }
            this.channelsNotified = channelsNotified
            await Database.Cache.General.set('channelsNotified', this.channelsNotified)
        }

        await Database.Cache.General.set('StreamersOnline', this.streamersOnline)
        await Database.Cache.General.set('StreamersOffline', this.streamersOffline)
        return setTimeout(() => this.refreshStreamersCache(false), 1000 * 5)
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
        setTimeout(() => this.setCounter(), 1000 * 30)
        return
    }

    async deleteChannelFromTwitchNotification(channelId) {

        for (const streamer of this.streamers) {
            this.data[streamer] = this.data[streamer]?.filter(id => id != channelId)
            this.channelsNotified[streamer] = await Database.Cache.General.pull(`channelsNotified.${streamer}`, cId => [channelId, null].includes(cId))
        }

        await Database.Guild.updateMany(
            {},
            { $pull: { TwitchNotifications: { channelId } } }
        )

        return
    }

}