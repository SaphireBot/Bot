import { ChatInputCommandInteraction, Message, MessageType } from "discord.js";
import { Database, SaphireClient as client } from "../../../classes/index.js";
import { Emojis as e } from "../../../util/util.js";
import { socket } from "../../../websocket/websocket.js";

export default new class AfkManager {
    constructor() {
        this.data = new Map()
        this.global = new Map()
    }

    async load() {
        const allData = await Database.Cache.AfkSystem.all().catch(() => []) || []
        const globalData = await Database.Cache.AfkSystem.get('Global').catch(() => { }) || {}
        if (!allData.length) return setTimeout(() => this.load(), 1000 * 60 * 3)

        const toDelete = []
        const toDeleteGlobal = []

        for (const data of allData) {
            if (data.id == 'Global') continue
            if (typeof data.value !== 'string') {
                toDelete.push(data.id)
                continue
            }
            this.data.set(data.id, data.value)
            continue
        }

        for (const key of Object.keys(globalData)) {
            const content = globalData[key]
            if (typeof content !== 'string') {
                toDeleteGlobal.push(data.id)
                continue
            }
            this.global.set(key, content)
            continue
        }

        if (client.shardId == 0) {
            for (const id of toDelete) await Database.Cache.AfkSystem.delete(id)
            for (const id of toDeleteGlobal) await Database.Cache.AfkSystem.delete(`Global.${id}`)
        }

        return setTimeout(() => this.load(), 1000 * 60 * 3)
    }

    /**
     * @param { ChatInputCommandInteraction} interaction 
     */
    async enable(interaction) {

        await interaction.reply({ content: `${e.Loading} | Ativando seu AFK...`, ephemeral: true })

        const { options, guild, user, member } = interaction
        const message = options.getString('message') || 'No Message'
        const where = options.getString('onde') === "server" ? guild.id : 'Global'

        await Database.Cache.AfkSystem.set(`${where}.${user.id}`, message)

        if (where == 'Global') {
            this.global.set(user.id, message)
            if (socket?.connected) socket?.send({ type: "AfkGlobalSystem", userId: user.id, message, method: "save" })
        }
        else {

            if (!this.data.has(guild.id)) this.data.set(guild.id, {})

            const data = this.data.get(guild.id)
            data[user.id] = message
            this.data.set(guild.id, data)
        }

        if (!member.displayName?.includes('[AFK]'))
            member.setNickname(`${member.displayName} [AFK]`, 'AFK Command Enable').catch(() => { })
        return interaction.editReply({
            content: `${e.Check} | Você ativou o AFK. Eu vou avisar todos que marcarem você.${message != 'No Message' ? `\n📝 | ${message}` : ''}`
        }).catch(() => { })
    }

    /**
     * @param { ChatInputCommandInteraction} interaction 
     */
    async disable(interaction) {
        const { user, member, guildId } = interaction
        this.unset(guildId, user.id)
        member.setNickname(member.displayName.replace(/\[AFK\]/g, ''), 'AFK Command Disable').catch(() => { })
        return interaction.reply({ content: `${e.Check} | Sistema AFK desativado.`, ephemeral: true })
    }

    async unset(guildId, userId) {

        await Database.Cache.AfkSystem.delete(`${guildId}.${userId}`)
        if (this.data.has(guildId)) {
            const data = this.data.get(guildId)
            delete data[userId]
            this.data.set(guildId, data)
        }
        await Database.Cache.AfkSystem.delete(`Global.${userId}`)

        if (this.global.has(userId) || socket?.connected) socket?.send({ type: "AfkGlobalSystem", userId, method: "delete" })
        this.global.delete(userId)
        return
    }

    saveGlobal({ userId, message }) {
        if (!userId || !message) return
        this.global.set(userId, message)
        return
    }

    async deleteGlobal(userId) {
        if (!userId) return
        this.global.delete(userId)
        return
    }

    /**
     * @param { Message } message
     */
    async check(message) {

        const { author, member, type, bot, guildId } = message

        if (
            !message
            || !member
            || !message?.id
            || !guildId
            || ![MessageType.Default, MessageType.Reply].includes(type)
            || bot
        ) return

        const guildData = this.data.get(guildId) || {}

        if (member.displayName.includes('[AFK]'))
            member.setNickname(member.displayName.replace(/\[AFK\]/g, ''), 'AFK Command Disable').catch(() => { })

        if (guildData[author.id] || this.global.has(author.id)) {
            this.unset(guildId, author.id)
            return message.reply({
                content: guildData[author.id]
                    ? `${e.Afk} | O sistema de AFK foi desativado automaticamente.`
                    : `${e.Afk} | O sistema de AFK Global foi desativado automaticamente.`
            }).then(pushDelete).catch(() => { })
        }

        const mentions = message.mentions.members
        if (!mentions.size) return

        let content = ""

        mentions.forEach(Member => {

            socket?.send({
                type: "notification",
                notifyData: {
                    userId: Member.user?.id,
                    title: `${message.author.globalName || message.author.username} mencionou você`,
                    message: `Confira a menção clicando <a href='${message.url}'>aqui</a>.`
                }
            })

            const globalMessage = this.global.get(Member.user.id)
            if (globalMessage) {
                if (!Member?.displayName?.includes('[AFK]'))
                    Member.setNickname(`${Member.displayName} [AFK]`, 'AFK Command Enable').catch(() => { })
                content += `\n${e.Afk} | ${Member.user.username} está offline globalmente.${globalMessage === 'No Message' ? "" : `\n📝 | ${globalMessage}`}\n`
            }

            const serverMessage = guildData[Member.user.id]
            if (serverMessage)
                content += `\n${e.Afk} | ${Member.user.username} está offline.${serverMessage === 'No Message' ? "" : `\n📝 | ${serverMessage}`}\n`

            if (!globalMessage && !serverMessage && Member?.displayName?.includes('[AFK]'))
                Member.setNickname(Member.displayName.replace('[AFK]', ''), 'AFK Command Desabled').catch(() => { })

        })

        if (content.length > 0)
            return message.reply({ content: content.limit('MessageContent') }).then(pushDelete).catch(() => null)

        function pushDelete(msg) {
            return setTimeout(() => client.pushMessage({ method: 'delete', channelId: msg.channelId, messageId: msg.id }), 1000 * 7)
        }
        return
    }

}