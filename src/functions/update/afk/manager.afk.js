import { ChatInputCommandInteraction, Message, MessageType } from "discord.js"
import { Database, SaphireClient as client } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"

export default new class AfkManager {
    constructor() {
        this.data = {}
        this.global = {}
    }

    async load() {
        const allData = await Database.Cache.AfkSystem.all() || []
        if (!allData.length) return

        for (const data of allData)
            data.id == 'Global' ? this.global = data.value : this.data[data.id] = data.value

        return
    }

    /**
     * @param { ChatInputCommandInteraction} interaction 
     */
    async enable(interaction) {

        const { options, guild, user, member } = interaction
        const message = options.getString('message') || 'No Message'
        const where = options.getString('onde') === "server" ? guild.id : 'Global'

        await Database.Cache.AfkSystem.set(`${where}.${user.id}`, message)

        if (where == 'Global') this.global[user.id] = message
        else {
            if (!this.data[where]) this.data[where] = {}
            this.data[where][user.id] = message
        }

        member.setNickname(`${member.displayName} [AFK]`, 'AFK Command Enable').catch(() => { })
        return await interaction.reply({
            content: `${e.Check} | Você ativou o AFK. Eu vou avisar todos que marcarem você.${message != 'No Message' ? `\n📝 | ${message}` : ''}`,
            ephemeral: true
        })
    }

    /**
     * @param { ChatInputCommandInteraction} interaction 
     */
    async disable(interaction) {
        const { guild, user, member } = interaction
        await Database.Cache.AfkSystem.delete(`${guild.id}.${user.id}`)

        if (this.data[guild.id])
            delete this.data[guild.id][user.id]

        await Database.Cache.AfkSystem.delete(`Global.${user.id}`)
        delete this.global[user.id]

        member.setNickname(member.displayName.replace('[AFK]', ''), 'AFK Command Disable').catch(() => { })
        return await interaction.reply({ content: `${e.Check} | Sistema AFK desativado.`, ephemeral: true })
    }

    /**
     * @param { Message } message
     */
    async check(message) {

        const { author, member, channelId, type, bot, guildId } = message

        if (
            !message
            || !member
            || !message?.id
            || !guildId
            || ![MessageType.Default, MessageType.Reply].includes(type)
            || bot
        ) return

        const inServerAuthorAFK = this.data[guildId] ? this.data[guildId][author.id] : undefined
        const inGlobalAuthorAFK = this.global[author.id]

        if (member.displayName.includes('[AFK]'))
            member.setNickname(member.displayName.replace('[AFK]', ''), 'AFK Command Disable').catch(() => { })

        if (inServerAuthorAFK || inGlobalAuthorAFK) {

            Database.Cache.AfkSystem.delete(`${guildId}.${author.id}`).catch(() => { })
            if (this.data[guildId]) delete this.data[guildId][author.id]

            Database.Cache.AfkSystem.delete(`Global.${author.id}`).catch(() => { })
            delete this.global[author.id]

            return message.reply({
                content: inServerAuthorAFK ? `${e.Afk} | O sistema de AFK foi desativado automaticamente.` : `${e.Afk} | O sistema de AFK Global foi desativado automaticamente.`
            }).then(pushDelete).catch(() => { })
        }

        const mentions = message.mentions.members
        if (!mentions.size) return

        let content = ""

        mentions.forEach(Member => {

            const globalMessage = this.global[Member.user.id]
            if (globalMessage) {
                if (!Member?.displayName?.includes('[AFK]'))
                    Member.setNickname(`${Member.displayName} [AFK]`, 'AFK Command Enable').catch(() => { })
                content += `\n${e.Afk} | ${Member.user.tag} está offline globalmente.${globalMessage === 'No Message' ? "" : `\n📝 | ${globalMessage}`}\n`
            }

            const serverMessage = this.data[Member.user.id]
            if (serverMessage)
                content += `\n${e.Afk} | ${Member.user.tag} está offline.${serverMessage === 'No Message' ? "" : `\n📝 | ${serverMessage}`}\n`

            if (!globalMessage && !serverMessage && Member?.displayName?.includes('[AFK]'))
                Member.setNickname(Member.displayName.replace('[AFK]', ''), 'AFK Command Desabled').catch(() => { })

        })

        if (content.length > 0)
            return message.reply({
                content: content.limit('MessageContent')
            }).then(pushDelete).catch(() => null)

        function pushDelete(msg) {
            return setTimeout(() => client.pushMessage({
                method: 'delete',
                channelId,
                messageId: msg.id
            }), 1000 * 7)
        }
        return
    }

}