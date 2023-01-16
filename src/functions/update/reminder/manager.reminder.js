import { Database, Modals, SaphireClient as client } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"
import timeMs from "../../plugins/timeMs.js"
import execute from './src/start.reminder.js'

export default new class ReminderManager {
    constructor() {
        this.reminders = []
        this.toDelete = []
    }

    async define() {

        const AllRemindersData = await Database.Reminder.find({}) || []
        if (!AllRemindersData || !AllRemindersData.length) return

        for (const data of AllRemindersData) {

            if (data.Alerted || !data.guildId || !data.RemindMessage || !data.userId) {
                this.toDelete.push(data)
                continue
            }

            const timeRemain = (data.DateNow + data.Time) - Date.now()

            if (timeRemain <= 0) {
                execute({ user: data.userId, data })
                continue
            } else {
                this.reminders.push(data)
                setTimeout(() => execute({ user: data.userId, data }), timeRemain)
            }
        }

        return this.drop()
    }

    async setAlert(reminderId) {
        const reminder = this.reminders.find(r => r.id === reminderId)
        if (!reminder) return
        await Database.Reminder.updateOne({ id: reminderId }, { Alerted: true })
        reminder.Alerted = true
        return
    }

    async drop() {
        await Database.Reminder.deleteMany({ id: { $in: this.toDelete.map(r => r.id) } })
    }

    async revalide(reminderId, definedTime, user) {

        const reminderData = await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            { Time: definedTime, DateNow: Date.now(), Alerted: false },
            { new: true }
        )

        return this.start(user, reminderData, definedTime)
    }

    start(user, data, timeMs) {
        setTimeout(() => execute({ user, data }), timeMs)
    }

    async remove(reminderId) {
        await Database.Reminder.deleteOne({ id: reminderId })
        this.reminders.splice(this.reminders.findIndex(r => r.id === reminderId), 1)
        return
    }

    async removeAllRemindersFromAnUser(userId) {
        await Database.Reminder.deleteMany({ userId })
        this.reminders = this.reminders.filter(r => r.userId !== userId)
        return
    }

    async save(data) {
        return new Database
            .Reminder(data)
            .save()
            .then(doc => {
                this.reminders.push(doc)
                return doc
            })
            .catch(err => err)
    }

    async show(interaction, reminderId, toEdit) {

        const data = this.reminders.find(reminder => reminder.id === reminderId)

        if (!data)
            return await interaction.reply({
                content: `${e.Deny} | Lembrete não encontrado.`,
                ephemeral: true
            })

        let guild = await client.guilds.fetch(data.guildId)
            .catch(() => null)

        const channel = await guild?.channels?.fetch(data.ChannelId)
            .then(ch => `${ch?.name} - \`${data.ChannelId}\``)
            .catch(() => `Not Found - \`${data.ChannelId}\``)

        guild = `${guild?.name || 'Not Found'} - \`${data.guildId}\``

        const responseData = {
            embeds: [{
                color: client.blue,
                title: '🔍 Lembrete Viewer',
                description: `O ID deste lembrete é \`${data.id}\``,
                fields: [
                    {
                        name: '🗺️ Local de Disparo',
                        value: `Canal **${channel}**\nServidor **${guild}**`
                    },
                    {
                        name: '📝 Mensagem',
                        value: data.RemindMessage || 'Sem mensagem definida'
                    },
                    {
                        name: '⏱️ Tempo Definido',
                        value: `${Date.GetTimeout(data.Time, data.DateNow, 'f')}\n${data.Alerted ? 'Este lembrete já foi disparado' : 'Este lembrete não foi disparado'}`
                    }
                ]
            }],
            components: [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'reminder',
                    placeholder: 'Funções do Lembrete',
                    options: [
                        {
                            label: 'Editar',
                            emoji: '📝',
                            description: 'Edite o mensagem e a hora que você definiu',
                            value: JSON.stringify({ c: 'edit', reminderId })
                        },
                        {
                            label: 'Deletar',
                            emoji: e.Trash,
                            description: 'Delete para sempre o lembrete',
                            value: JSON.stringify({ c: 'delete', reminderId })
                        },
                        {
                            label: 'Mover lembrete para este canal',
                            emoji: '🗺️',
                            description: 'Definir que o lembrete seja disparado aqui',
                            value: JSON.stringify({ c: 'move', reminderId })
                        },
                        {
                            label: 'Deletar mensagem',
                            emoji: '❌',
                            description: 'Apague está mensagem e finja que nada aconteceu',
                            value: JSON.stringify({ c: 'deleteMessage' })
                        }
                    ]
                }]
            }]
        }

        if (toEdit)
            return await interaction.update(responseData).catch(() => { })
        else return await interaction.reply(responseData)
    }

    async move(interaction, reminderId) {

        const data = this.reminders.find(reminder => reminder?.id === reminderId)

        if (!data)
            return await interaction.update({
                content: `${e.Deny} | Lembrete não encontrado.`,
                embeds: [], components: [],
                ephemeral: true
            }).catch(() => { })

        if (data.ChannelId === interaction.channel.id)
            return await interaction.reply({
                content: `${e.Deny} | Este lembrete já está programado para disparar neste canal.`,
                ephemeral: true
            })

        await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            {
                $set: { guildId: interaction.guild.id, ChannelId: interaction.channel.id }
            },
            { new: true }
        )

        this.reminders = []
        await this.define()
        return this.show(interaction, reminderId, true)
    }

    async requestEdit(interaction, reminderId) {

        const reminder = this.reminders.find(reminder => reminder?.id === reminderId)

        if (!reminder)
            await interaction.update({
                content: `${e.Deny} | Lembrete não encontrado`,
                embeds: [], components: []
            }).catch(() => { })

        const date = Date.stringDate((reminder.DateNow + reminder.Time) - Date.now())
        const message = reminder.RemindMessage

        interaction.message.delete().catch(() => { })

        if (!date || !message)
            return await interaction.update({
                content: `${e.Deny} | Lembrete não encontrado ou já disparado`,
                embeds: [], components: []
            }).catch(() => { })

        return await interaction.showModal(Modals.ReminderEdit(date, message, reminderId))
    }

    async edit(interaction, reminderId) {

        const { fields } = interaction
        const RemindMessage = fields.getTextInputValue('message') || null
        const date = fields.getTextInputValue('date') || 0
        const Time = timeMs(date)

        if (!date)
            return await interaction.reply({
                content: `${e.Deny} | O tempo dado não é válido. Atualização cancelada.`,
                ephemeral: true
            })

        if (!RemindMessage)
            return await interaction.reply({
                content: `${e.Deny} | Mensagem não encontrada.`,
                ephemeral: true
            })

        const data = this.reminders.find(reminder => reminder?.id === reminderId)

        if (data.Time === Time && RemindMessage === data.RemindMessage)
            return await interaction.reply({
                content: `${e.Deny} | Qual é, tá mesmo solicitando uma edição para editar a mesma coisa? Cancelei essa edição só por causa dos valores identicos.`,
                ephemeral: true
            })

        if (date <= 3000)
            return await interaction.reply({
                content: `${e.Deny} | O tempo mínimo é 3 segundos.`,
                ephemeral: true
            })

        await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            { $set: { Time, RemindMessage, DateNow: Date.now() } },
            { new: true }
        )

        this.reminders = []
        await this.define()
        return this.show(interaction, reminderId)
    }

}