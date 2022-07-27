import { Database } from '../index.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'

export default class Reminder {
    constructor(message, confirmationMessage, data = {
        RemindMessage: String,
        Time: Number,
        isAutomatic: Boolean,
        DateNow: Number
    }) {
        this.time = data.Time
        this.user = message.interaction?.user || message.repliedUser
        this.message = message
        this.reminderData = data
        this.confirmationMessage = confirmationMessage
    }

    async showButton() {

        this.message.edit({
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '⏰',
                        custom_id: 'setReminder',
                        style: 3
                    }
                ]
            }]
        })

        return this.message.createMessageComponentCollector({
            filter: int => int.user.id === this.user.id,
            time: 120000,
            max: 1,
            errors: ['time', 'max']
        })
            .on('collect', () => this.saveReminder())
            .on('end', () => this.message.edit({ components: [] }).catch(() => { }))
    }

    async saveReminder() {

        const code = this.reminderData.id = CodeGenerator(7).toUpperCase()
        this.reminderData.userId = this.user.id
        this.reminderData.ChannelId = this.message.channel.id

        new Database.Reminder(this.reminderData).save()
        return this.message.channel.send({ content: this.confirmationMessage.replace(/ReplaceTIMER/g, Date.GetTimeout(this.time, this.reminderData.DateNow, 'F')) })
    }
}