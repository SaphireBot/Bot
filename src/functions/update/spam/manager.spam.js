import { Message } from "discord.js"
import { SaphireClient as client, Database } from "../../../classes/index.js"

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
                this.deleteMessage(message.id, message.channelId, message.author.id)
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
                this.deleteMessage(message.id, message.channelId, message.author.id)
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

        const content = message.content
        const total = content.length
        let upperCaseLetters = 0

        for (const letter of content)
            if (letter == letter.toUpperCase())
                upperCaseLetters++

        const percent = parseInt((upperCaseLetters / total) * 100)
        if (percent >= guildData.filters.capsLock.percent) {
            if (message.deletable) {
                this.deleteMessage(message.id, message.channelId, message.author.id)
                return true
            }
        }

        return false
    }

    warn(authorId) {
        return this.userData[authorId]?.warns ? this.userData[authorId].warns++ : this.userData[authorId].warns = 1
    }

    deleteMessage(messageId, channelId, authorId) {
        this.warn(authorId)
        client.pushMessage({ method: 'delete', messageId, channelId })
        return
    }

    async getGuildData(guildId) {
        return this.guildData[guildId]
            ? { Spam: this.guildData[guildId] }
            : await Database.Guild.findOne({ id: guildId }, 'Spam')
    }
}