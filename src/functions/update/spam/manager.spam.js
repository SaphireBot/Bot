import { Message } from "discord.js"
import { SaphireClient as client, Database } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"

export default new class SpamManager {
    constructor() {
        this.guildsEnabled = []
        this.guildData = {}
        this.userData = {}
    }

    load(guildsData) {
        this.guildsEnabled = guildsData.filter(gData => gData.Spam?.enabled === true)?.map(gData => gData.id)

        if (!this.guildsEnabled.length) return

        for (const guildId of this.guildsEnabled) {
            const data = guildsData.find(gData => gData.id == guildId)
            if (data.Spam.enabled !== true) continue
            this.guildData[guildId] = data.Spam
            this.guildData[guildId].GSN = data.LogSystem?.channel
            continue
        }

        return
    }

    /**
     * @param { Message } message 
     */
    check(message) {

        if (!message || !message.guild || !this.guildsEnabled.includes(message.guildId)) return

        const guildData = this.guildData[message.guildId]
        if (!guildData || !guildData.enabled) return

        if (!this.userData[message.author.id])
            this.userData[message.author.id] = {}

        if (
            guildData.ignoreChannels.includes(message.channelId)
            || message.member.roles.cache.some(role => guildData.ignoreRoles?.includes(role.id))
        ) return

        const isReapeat = this.repeatMessage(guildData, message)
        if (isReapeat) return

        const capsLock = this.capsLock(guildData, message)
        if (capsLock) return

        this.messagesTimer(guildData, message)
        return
    }

    /**
     * @param { Message } message
     * @returns Boolean
     */
    messagesTimer(guildData, message) {
        if (!guildData.filters?.messagesTimer?.enabled) return false

        this.userData[message.author.id].messagesSent
            ? this.userData[message.author.id].messagesSent++
            : this.userData[message.author.id].messagesSent = 1

        if (this.userData[message.author.id].messagesSent > guildData?.filters?.messagesTimer?.amount)
            if (message.deletable) {
                this.deleteMessage(message, 'timer')
                return true
            }

        if (!this.userData[message.author.id].onCheck && guildData?.filters?.messagesTimer?.seconds > 0) {
            this.userData[message.author.id].onCheck = true
            setTimeout(() => {
                this.userData[message.author.id].messagesSent = 0
                this.userData[message.author.id].onCheck = false
            }, guildData.filters?.messagesTimer?.seconds * 1000)
        }

        return false
    }

    /**
     * @param { Message } message
     * @returns Boolean
     */
    repeatMessage(guildData, message) {
        if (!guildData.filters?.repeat?.enabled || !message.content?.length) return false

        if (this.userData[message.author.id].lastMessage == message.content)
            if (message.deletable) {
                this.deleteMessage(message, 'repeat')
                this.userData[message.author.id].lastMessage = message.content
                return true
            }

        this.userData[message.author.id].lastMessage = message.content
        return false
    }

    /**
     * @param { Message } message
     * @returns Boolean
     */
    capsLock(guildData, message) {
        if (!guildData?.filters?.capsLock?.enabled || message.content?.length < 10) return false

        const content = message.content || ""
        const total = content.length
        const upperCaseLetters = (content.match(/[A-ZÁÂÃÀÉÊÍÓÔÕÚÜÇ]/g) || []).length
        const percent = parseInt((upperCaseLetters / total) * 100)


        if (percent >= guildData.filters.capsLock.percent) {
            if (message.deletable) {
                this.deleteMessage(message, 'capslock')
                return true
            }
        }

        return false
    }

    warn(authorId) {
        return this.userData[authorId]?.warns ? this.userData[authorId].warns++ : this.userData[authorId].warns = 1
    }

    /**
     * @param { Message } message 
     * @param { 'timer' | 'repeat' | 'capslock' } method
     */
    deleteMessage(message, method) {
        this.warn(message.author.id)
        client.pushMessage({ method: 'delete', messageId: message.id, channelId: message.channel.id })

        const formatMethod = {
            timer: 'Limite de mensagens por segundo excedido.',
            repeat: 'Mensagens repetidas.',
            capslock: 'Abuso de Capslock'
        }[method]

        const filters = this.guildData[message.guildId]?.filters || {}
        const feedbackMethod = {
            timer: `Heeey, maneira nas mensagens. Você só pode enviar **${filters.messagesTimer?.amount || 0} mensagens** em **${filters.messagesTimer?.seconds} segundos**.`,
            repeat: 'OOOOOU. Nada de mensagens repetidas, ok?',
            capslock: `Psiu, os administradores desse servidor limitou o Caps Lock em **${filters.capsLock?.percent}%**.`
        }[method]

        if (
            !this.userData[message.author.id].alerted
            || this.userData[message.author.id].alerted < Date.now()
        ) {
            this.userData[message.author.id].alerted = Date.now() + (1000 * 30)
            message.channel.send({
                content: `${e.SaphireRevoltada} | ${feedbackMethod || 'Anti-Spam Detected.'}`
            }).then(msg => setTimeout(() => client.pushMessage({ method: 'delete', messageId: msg.id, channelId: msg.channelId }), 1000 * 4)).catch(() => { })
        }

        if (this.guildData[message.guild.id]?.GSN)
            client.pushMessage({
                method: 'post',
                channelId: this.guildData[message.guild.id].GSN,
                body: {
                    embeds: [{
                        color: client.blue,
                        title: '🛰️ | **Global System Notification** | Anti-Spam System',
                        description: `👤 ${message.member} \`${message.author.id}\`\n💬 ${message.channel} \`${message.channelId}\``,
                        fields: [
                            {
                                name: '🛡️ Motivo',
                                value: formatMethod || 'Não reconhecido'
                            },
                            {
                                name: '📖 Conteúdo da Mensagem',
                                value: `\`\`\`txt\n${message.content?.limit('MessageEmbedFieldValue') || 'Nada aqui'}\n\`\`\``
                            }
                        ],
                        footer: {
                            text: `${this.userData[message.author.id]?.warns || 0} warns`
                        }
                    }]
                }
            })
        return
    }

    async getGuildData(guildId) {
        return this.guildData[guildId]
            ? { Spam: this.guildData[guildId] }
            : await Database.Guild.findOne({ id: guildId }, 'Spam')
    }
}