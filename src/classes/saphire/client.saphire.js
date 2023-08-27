import { ApplicationRoleConnectionMetadataType, Client, Collection, Guild, Message, Routes, messageLink } from 'discord.js'
import { Database, Discloud } from '../index.js'
import { ClientOptions, Emojis as e } from '../../util/util.js'
import { Config as config } from '../../util/Constants.js'
import { socket } from '../../websocket/websocket.js'
import axios from 'axios'

/**
 * Extensão do Discord.Client para melhor performance e praticidade
 */
export default new class client extends Client {
    constructor() {
        super(ClientOptions)

        this.animes = []
        this.slashCommands = new Collection()

        /**
         * @returns BLUE - Hexadecimal
         */
        this.blue = 0x246FE0

        /**
         * @returns RED - Hexadecimal
         */
        this.red = 0xED4245

        /**
         * @returns GREEN - Hexadecimal
         */
        this.green = 0x57F287

        /**
         * @returns Command name and your id [array]
         */
        this.slashCommandsData = []

        /**
         * @returns Uma string com dados da atualização
         */
        this.restart = null

        /**
         * @param Nothing
         * @returns Um array com todos os usuários de todas as Shards
         * @example [user1, user2, user3, user4, user5, user6]
         */
        this.allUsers = []

        /**
         * @returns Shard Client ID
         */
        this.shardId = undefined

        /**
         * @returns [adminId1, adminId2]
         */
        this.admins = [config.ownerId]

        /**
         * @returns [modId1, modId2]
         */
        this.mods = [config.ownerId]

        /**
         * @returns [staff1, staff2]
         */
        this.staff = [config.ownerId]

        /**
         * @retuns [FanartsObject]
         */
        this.fanarts = []

        /**
         * @returns Contagem de Eventos
         */
        this.interactions = 0 // Interações Recebidas
        this.messages = 0 // Mensagens Recebidas
        this.commandsUsed = {} // Comandos Usados

        /**
         * @returns Heartbeat
         */
        this.Heartbeat = 0

        /**
         * @returns Array com todas as cantadas do banco de dados
         */
        this.cantadas = []

        /**
         * @returns Conteúdo do client no banco de dados
         */
        this.clientData = {}

        /**
         * @returns Array com todos os memes não aprovados do banco de dados
         */
        this.MemesNotApproved = []

        /**
         * @returns Array com todos os canais em jogo
         */
        this.chatsInGame = []

        /**
         * @returns Messages to send
         */
        this.messagesToSend = []
        this.blockedChannels = {}
    }

    get clusterName() {
        // Bellatrix, Antares, Sollaris, Lunnaris, Nashira
        return {
            discloud: "Bellatrix",
            localhost: "Antares"
        }[process.env.MACHINE] || "Estrela"
    }

    /**
     * @param Nothing
     * @returns Um array com todos os usuários de todas as Shards em cada array
     * @example [[user1, user2, user3], [user4, user5, user6]]
     */
    async allUsersData() {
        return await this.shard.broadcastEval(client => client.users.cache)
    }

    async start() {
        await Database.MongoConnect()
        await import('../../structures/handler/events.handler.js')
        await super.login()
        return
    }

    async setCantadas() {
        const allCantadas = await Database.Cantadas.find({})
        if (!allCantadas || !allCantadas.length) return

        this.cantadas = allCantadas
        return
    }

    async refreshStaff(starting) {
        if (!starting) this.clientData = await Database.Client.findOne({ id: this.user.id })
        if (!this.clientData) return

        if (this.clientData.Administradores) this.admins = [...this.clientData.Administradores]
        if (this.clientData.Moderadores) this.mods = [...this.clientData.Moderadores]
        this.staff = [...this.admins, ...this.mods]

        if (this.shardId === 0) return this.setStaffToApi()

        return
    }

    async setStaffToApi() {

        const staffDataIds = {
            devs: ["451619591320371213", "395669252121821227", "920496244281970759", "435601052755296256", "648389538703736833"], // Rody, Gorniaky, Space, Lucaix, André
            admins: ["451619591320371213", "351903530161799178"], // Rody, Makol
            boards: ["395669252121821227", "648389538703736833"], // Gorniaky, André
            staff: ["854494598533742622", "611006830411251714", "781137239194468403", "830226550116057149", "327496267007787008", "144943581965189120", "737238491842347098", "435444989695229952"] // Akemy, Alli, Dspofu, Pepy, San, Serginho, Moana, Yafyr
        }

        for (const url of [
            `https://api.saphire.one/getusers/?${Array.from(new Set(Object.values(staffDataIds).flat())).slice(0, 10).map(id => `id=${id}`).join('&')}`,
            `https://api.saphire.one/getusers/?${Array.from(new Set(Object.values(staffDataIds).flat())).slice(10, 50).map(id => `id=${id}`).join('&')}`
        ])
            fetch(url)
                .then(res => res.json())
                .then(staffData => {

                    for (const staff of staffData) {

                        staff.avatarUrl = staff?.avatar
                            ? `https://cdn.discordapp.com/avatars/${staff.id}/${staff?.avatar}.${staff.avatar.includes("a_") ? "gif" : "png"}`
                            : null

                        staff.tags = []
                        if (staffDataIds.devs.includes(staff.id)) staff.tags.push("developer");
                        if (staffDataIds.admins.includes(staff.id)) staff.tags.push("adminstrator");
                        if (staffDataIds.boards.includes(staff.id)) staff.tags.push("board of directors");
                        if (staffDataIds.staff.includes(staff.id)) staff.tags.push("staff");
                        continue
                    }

                    socket?.send({ type: "siteStaffData", staffData })
                })
                .catch(console.log)

        return
    }

    async sendWebhook(webhookUrl, data) {

        return await axios.post(
            process.env.ROUTE_WEBHOOK_SENDER,
            {
                webhookUrl,
                ...data
            },
            {
                headers: {
                    authorization: process.env.WEBHOOK_SENDER_AUTHORIZATION
                }
            }
        )
            .then(() => true)
            .catch(err => err)
    }

    async getGuild(guildId) {
        if (!guildId) return null
        return await this.rest.get(Routes.guild(guildId))
            .then(guild => new Guild(this, guild))
            .catch(() => null)
    }

    async reload() {
        this.restart = `${e.Loading} | Reinicialização Automática Programada.`
        await Discloud.apps.restart('saphire').catch(() => { })
        return
    }

    /**
     * @param { Message } message 
     * @returns 
     */
    async linkedRolesLoad(message) {

        const msg = await message.reply({ content: `${e.Loading} | Registering Linked Roles...` })

        const bodyContent = [
            {
                key: 'balance',
                name: 'Safiras',
                description: 'Quantidade de Safiras mínima',
                type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual
            },
            {
                key: 'level',
                name: 'Levels',
                description: 'Quantidade de Level mínimo',
                type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual
            },
            {
                key: 'likes',
                name: 'Likes',
                description: 'Quantidade de Likes mínimo',
                type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual
            },
            {
                key: 'date_create',
                name: 'Dias de Conta',
                description: 'Dias com a conta criada',
                type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual
            }
        ]

        const response = await fetch(
            `https://discord.com/api/v10/applications/${this.user.id}/role-connections/metadata`,
            {
                method: "PUT",
                body: JSON.stringify(bodyContent),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                }
            }
        )

        let content = `${e.DenyX} | No response was given.`

        if (response.ok) {
            const data = await response.json();
            content = `${e.CheckV} | ${data?.length || 0} Linked Roles have been setted.`
        }

        if (!response.ok) {
            content = `${e.DenyX} | error to configuring payloads linked to Discord API. Logs wrote to console.`
            console.log(await response.text())
        }

        return msg.edit({ content })
            .catch(() => message.channel.send({ content }).catch(() => { }))
    }

    async getUser(userId) {
        return await this.rest.get(Routes.user(userId))
            .then(value => {
                if (!value) return null
                if (value.id == this.user.id) return null
                return {
                    id: value?.id,
                    username: value?.username,
                    tag: `${value?.username}`,
                    avatar: value?.avatar
                }
            })
            .catch(() => null)
    }

    async getMessageUrl(channelId, messageId) {
        return await this.rest.get(Routes.channelMessage(channelId, messageId))
            .then(() => messageLink(channelId, messageId))
            .catch(() => null)
    }

    async pushMessage(data) {
        if (
            !data?.method
            || !data.channelId
            || data.method != 'delete' && !data.body
        ) return

        if (data.body?.embeds?.length)
            data.body.embeds = data.body.embeds.flat()

        data.authorization = process.env.POST_MESSAGE
        if (socket?.connected)
            return socket?.send({ type: "postMessage", messageData: data })

        return this.postMessage(data)
    }

    async postMessage(data) {
        return await fetch(
            "https://api.saphire.one/message",
            {
                method: 'POST',
                body: JSON.stringify({
                    messageId: data.messageId,
                    channelId: data.channelId,
                    method: data.method,
                    ...data.body
                }),
                headers: {
                    authorization: process.env.POST_MESSAGE,
                    "Content-Type": "application/json"
                }
            }
        )
            .catch(err => this.errorInPostingMessage(data, err))
    }

    async errorInPostingMessage(data, err) {
        if (!data || !err) return

        if (
            err?.code == 10008
            || err?.rawError?.message == "Unknown Message"
        ) return // Unknown Message

        if (data.isTwitchNotification && socket)
            // Missing Access or Unknown Channel
            if ([50001, 10003].includes(err.code))
                return socket?.send({ type: "removeChannelFromTwitchManager", id: data.channelId })

        // Missing Access or Unknown Channel
        if (data.LogType == 'WelcomeChannel')
            if ([50001, 10003, 50035].includes(err.code))
                return await Database.Guild.findOneAndUpdate(
                    { id: data.guildId },
                    { $unset: { WelcomeChannel: true } },
                    { new: true }
                )
                    .then(data => Database.saveGuildCache(data?.id, data))

        if (
            data.LogType
            && data?.guildId
        )
            // Missing Access or Unknown Channel
            if ([50001, 10003].includes(err.code))
                return await Database.Guild.findOneAndUpdate(
                    { id: data.guildId },
                    { $unset: { [`LogSystem.${data.LogType}`]: true } },
                    { new: true, upsert: true }
                )
                    .then(doc => Database.saveGuildCache(doc?.id, doc))

        // Unknown Channel
        if ([10003].includes(err.code)) return
        return console.log(data, err)
    }

    async registerCommand({ commandName, guildId, userId, channelId, type, date = new Date() }) {

        if (
            typeof commandName !== 'string'
            || typeof guildId !== 'string'
            || typeof userId !== 'string'
            || typeof channelId !== 'string'
            || typeof type !== 'string'
        ) return

        await Database.Cache.Commands.push(`${userId}.${commandName}`, Date.now())
        await Database.Commands.updateOne(
            { id: commandName },
            {
                $inc: { count: 1 },
                $push: {
                    usage: {
                        $each: [{ guildId, userId, channelId, type, date }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )
    }

    async TwitchFetcher(url) {
        return await socket
            ?.timeout(1000 * 10)
            .emitWithAck("twitchFetcher", url)
            .then(res => res)
            .catch(() => null)
    }

}