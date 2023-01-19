import { Database, Modals, SaphireClient as client } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"
import timeMs from "../../plugins/timeMs.js"
import execute from './src/start.reminder.js'

export default new class ReminderManager {
    constructor() {
        this.reminders = []
        this.toDelete = []
        this.over32Bits = []
        this.checking = false
    }

    async define() {

        const AllRemindersData = await Database.Reminder.find({}) || []
        if (!AllRemindersData || !AllRemindersData.length) return

        for (const data of AllRemindersData) {

            if (data.Alerted || !data.guildId || !data.RemindMessage || !data.userId) {
                this.toDelete.push({ id: data.id })
                continue
            }

            const timeRemain = (data.DateNow + data.Time) - Date.now()

            if (timeRemain > 2147483647) {
                this.over32Bits.push({
                    id: data.id,
                    userId: data.userId,
                    guildId: data.guildId,
                    RemindMessage: data.RemindMessage,
                    Time: data.Time,
                    snoozed: false,
                    timeout: false,
                    isAutomatic: data.isAutomatic,
                    DateNow: data.DateNow,
                    ChannelId: data.ChannelId
                })
                continue
            }

            const timeout = setTimeout(() => execute({ user: data.userId, data }), timeRemain <= 0 ? 0 : timeRemain)
            this.reminders.push({
                id: data.id,
                userId: data.userId,
                guildId: data.guildId,
                RemindMessage: data.RemindMessage,
                Time: data.Time,
                snoozed: false,
                timeout,
                isAutomatic: data.isAutomatic,
                DateNow: data.DateNow,
                ChannelId: data.ChannelId
            })
        }

        this.checkBits()
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

    start(user, data) {
        const reminder = [...this.reminders, ...this.over32Bits].find(r => r.id === data.id)
        const remainTime = (data.DateNow + data.Time) - Date.now()

        if (!reminder && remainTime > 2147483647) {
            this.over32Bits.push(data)
            if (!this.checking) this.checkBits()
            return
        }

        const timeout = setTimeout(() => execute({ user, data }), remainTime)

        if (!reminder)
            return this.reminders.push({
                id: data.id,
                userId: data.userId,
                guildId: data.guildId,
                RemindMessage: data.RemindMessage,
                Time: data.Time,
                snoozed: data.snoozed,
                timeout: timeout,
                isAutomatic: data.isAutomatic,
                DateNow: data.DateNow,
                ChannelId: data.ChannelId,
                Alerted: data.Alerted,
            })

        reminder.timeout = timeout
        return reminder
    }

    checkBits() {
        this.checking = true

        if (!this.over32Bits.length)
            return this.checking = false

        for (let reminder of this.over32Bits) {
            const remainTime = (reminder.DateNow + reminder.Time) - Date.now()
            if (remainTime < 2147483647) {
                this.reminders.push(reminder)
                this.start(reminder.userId, reminder)
                this.over32Bits.splice(this.over32Bits.findIndex(r => r.id === reminder.id), 1)
                continue
            } else continue
        }

        return setTimeout(() => this.checkBits(), 600000)
    }

    async remove(reminderId) {
        await Database.Reminder.deleteOne({ id: reminderId })
        const reminderEnable = this.reminders.find(r => r.id === reminderId)
        const reminderOver = this.over32Bits.find(r => r.id === reminderId)

        if (reminderEnable) {
            clearTimeout(reminderEnable?.timeout)
            return this.reminders.splice(this.reminders.findIndex(r => r.id === reminderId), 1)
        }

        if (reminderOver) {
            return this.over32Bits.splice(this.over32Bits.findIndex(r => r.id === reminderId), 1)
        }

        return
    }

    async removeAllRemindersFromAnUser(userId) {
        await Database.Reminder.deleteMany({ userId })
        this.reminders = this.reminders.filter(r => r.userId !== userId)
        this.over32Bits = this.over32Bits.filter(r => r.userId !== userId)
        return
    }

    async save(user, data) {
        return new Database
            .Reminder(data)
            .save()
            .then(async doc => {
                if (doc.Time > 2147483647)
                    this.over32Bits.push({
                        id: doc.id,
                        userId: doc.userId,
                        guildId: doc.guildId,
                        RemindMessage: doc.RemindMessage,
                        Time: doc.Time,
                        snoozed: false,
                        timeout: false,
                        isAutomatic: doc.isAutomatic,
                        DateNow: doc.DateNow,
                        ChannelId: doc.ChannelId,
                        Alerted: doc.Alerted
                    })
                else {
                    this.reminders.push({
                        id: doc.id,
                        userId: doc.userId,
                        guildId: doc.guildId,
                        RemindMessage: doc.RemindMessage,
                        Time: doc.Time,
                        snoozed: false,
                        timeout: false,
                        isAutomatic: doc.isAutomatic,
                        DateNow: doc.DateNow,
                        ChannelId: doc.ChannelId,
                        Alerted: doc.Alerted
                    })
                    await this.start(user, doc)
                }
                return doc
            })
            .catch(() => null)
    }

    async show(interaction, reminderId, toEdit) {

        const data = [...this.reminders, ...this.over32Bits].find(reminder => reminder.id === reminderId)

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
                        value: `${Date.GetTimeout(data.Time, data.DateNow, 'f')} (${Date.GetTimeout(data.Time, data.DateNow, 'R')})\n${data.Alerted ? 'Este lembrete já foi disparado' : 'Este lembrete não foi disparado'}${data.snoozed ? "\nLembrete adiado" : ""}`
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
                        }
                    ]
                }]
            }],
            ephemeral: true
        }

        if (toEdit)
            return await interaction.update(responseData).catch(() => { })
        else return await interaction.reply(responseData)
    }

    async move(interaction, reminderId) {

        const data = [...this.reminders, ...this.over32Bits].find(reminder => reminder?.id === reminderId)

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

        const edited = await Database.Reminder.updateOne(
            { id: reminderId },
            {
                $set: { guildId: interaction.guild.id, ChannelId: interaction.channel.id }
            }
        ).catch(err => err)

        if (!edited)
            return await interaction.update({
                content: `${e.Deny} | Não foi possível editar este lembrete.\n${e.bug} | \`${edited}\``,
                embeds: [], components: []
            }).catch(() => { })

        data.guildId = interaction.guild.id
        data.ChannelId = interaction.channel.id
        if (data?.timeout) clearTimeout(data.timeout)
        this.start(interaction.user, data)
        return this.show(interaction, reminderId, true)
    }

    async requestEdit(interaction, reminderId) {

        const reminder = [...this.reminders, ...this.over32Bits].find(reminder => reminder?.id === reminderId)

        if (!reminder)
            return await interaction.update({
                content: `${e.Deny} | Lembrete não encontrado`,
                embeds: [], components: []
            }).catch(() => { })

        const date = Date.stringDate((reminder.DateNow + reminder.Time) - Date.now())
        const message = reminder.RemindMessage

        await interaction.message.delete().catch(() => { })

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

        const indexBits = this.over32Bits.findIndex(r => r?.id === reminderId)
        const indexReminders = this.reminders.findIndex(r => r?.id === reminderId)
        const data = this.reminders[indexReminders] || this.over32Bits[indexBits]

        if (data.Time == Time && RemindMessage == data.RemindMessage)
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

        data.Time = Time
        data.RemindMessage = RemindMessage
        data.DateNow = Date.now()
        if (data?.timeout) clearTimeout(data.timeout)

        if (indexBits >= 0)
            this.over32Bits.splice(indexBits, 1)

        if (indexReminders >= 0)
            this.reminders.splice(indexReminders, 1)

        this.start(interaction.user, data)
        return this.show(interaction, reminderId, true)
    }

    async snooze(message, reminderId) {

        const data = this.reminders.find(r => r.id === reminderId)

        if (!data)
            return await message.edit({ content: `${e.Deny} | Lembrete não encontrado.` }).catch(() => { })

        const newData = await Database.Reminder.findOneAndUpdate(
            { id: data.id },
            {
                $set: {
                    Time: 600000, // 10 Minutes
                    DateNow: Date.now(),
                    snoozed: true,
                    Alerted: false
                }
            },
            { new: true }
        ).catch(() => null)

        if (!newData)
            return message.edit({ content: `${e.Deny} | Não foi possível adiar este lembrete.` }).catch(() => { })

        data.Time = newData.Time
        data.DateNow = newData.DateNow
        data.Alerted = false
        data.snoozed = true

        this.start(data.userId, data)
        return message.edit({
            content: `${e.Check} | Ok ok! Lembrete adiado (+10 minutos).\n⏱️ | Nova hora de disparo: ${Date.GetTimeout(newData.Time, newData.DateNow, 'R')}`
        }).catch(() => { })
    }

}