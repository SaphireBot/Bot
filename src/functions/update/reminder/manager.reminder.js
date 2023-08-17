// TODO: Sincronizar os lembretes com o websocket

import { Collection } from "discord.js"
import { Database, Modals, SaphireClient as client } from "../../../classes/index.js"
import { Emojis as e } from "../../../util/util.js"
import timeMs from "../../plugins/timeMs.js"
import execute from './src/start.reminder.js'
const intervals = {
    0: 'Disparo Único',
    1: 'Diariamente',
    2: 'Semanalmente',
    3: 'Mensal'
}

export default new class ReminderManager {
    constructor() {
        this.allReminders = new Collection()
        this.reminders = new Collection()
        this.over32Bits = new Collection()
        this.toDelete = []
        this.checking = false
    }

    async load() {

        const AllRemindersData = await Database.Reminder.find() || []
        if (!AllRemindersData || !AllRemindersData.length) return

        for (const data of AllRemindersData) {

            this.allReminders.set(data.id, data)

            if (data.Alerted || !data.guildId || !data.RemindMessage || !data.userId) {
                this.toDelete.push({ id: data.id })
                continue
            }

            const timeRemain = (data.DateNow + data.Time) - Date.now()

            if (timeRemain > 2147483647) {
                this.over32Bits.set(data.id, { ...data, snoozed: false, timeout: false })
                continue
            }

            let timeout;

            if (client.guilds.cache.has(data.guildId))
                timeout = setTimeout(() => execute({ user: data.userId, data }), timeRemain <= 0 ? 0 : timeRemain)

            this.reminders.set(data.id, { ...data, snoozed: false, timeout, })
        }

        this.refreshAllReminders()
        this.checkBits()
        return this.drop()
    }

    async setAlert(reminderId) {
        if (!this.reminders.has(reminderId)) return
        const doc = await Database.Reminder.findOneAndUpdate({ id: reminderId }, { Alerted: true }, { new: true })
        this.allReminders.set(doc?.id, doc)
        this.reminders.set(doc?.id, doc)
        return
    }

    async drop() {
        await Database.Reminder.deleteMany({ id: { $in: this.toDelete.map(r => r.id) } })
        for (const reminder of this.toDelete) {
            this.allReminders.delete(reminder?.id)
            this.reminders.delete(reminder?.id)
            this.over32Bits.delete(reminder?.id)
        }
    }

    async revalide(reminderId, definedTime, user) {

        const doc = await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            { Time: definedTime, DateNow: Date.now(), Alerted: false },
            { new: true }
        )

        this.allReminders.set(doc?.id, doc)
        return this.start(user, doc)
    }

    start(user, data) {
        const reminder = this.allReminders.get(data?.id)
        if (reminder?.timeout) clearTimeout(reminder.timeout)

        const remainTime = (data.DateNow + data.Time) - Date.now()

        if (remainTime > 2147483647) {
            this.reminders.delete(data.id)
            this.allReminders.set(data.id, data)
            this.over32Bits.set(data.id, data)
            if (!this.checking) this.checkBits()
            return
        }

        const timeout = setTimeout(() => execute({ user, data }), remainTime)

        if (!reminder) {
            this.reminders.set(data.id, { ...data, timeout: timeout })
            this.allReminders.set(data.id, { ...data, timeout: timeout })
            return
        }

        reminder.timeout = timeout
        this.allReminders.set(reminder?.id, reminder)
        this.reminders.set(reminder?.id, reminder)
        return reminder
    }

    checkBits() {
        this.checking = true

        if (!this.over32Bits.length)
            return this.checking = false

        for (const reminder of this.over32Bits.toJSON()) {
            const remainTime = (reminder.DateNow + reminder.Time) - Date.now()
            if (remainTime < 2147483647) {
                this.reminders.set(reminder.id, reminder)
                this.allReminders.set(reminder.id, reminder)
                this.over32Bits.delete(reminder.id)
                this.start(reminder.userId, reminder)
                continue
            }
            continue
        }

        return setTimeout(() => this.checkBits(), 1000 * 60 * 60)
    }

    async remove(reminderId) {
        await Database.Reminder.deleteOne({ id: reminderId })
        const reminderEnable = this.reminders.get(reminderId)
        if (reminderEnable?.timeout) clearTimeout(reminderEnable?.timeout)

        this.allReminders.delete(reminderId)
        this.reminders.delete(reminderId)
        this.over32Bits.delete(reminderId)
        return
    }

    async removeAllRemindersFromAnUser(userId) {
        await Database.Reminder.deleteMany({ userId })
        this.reminders = this.reminders.filter(r => r.userId !== userId)
        this.over32Bits = this.over32Bits.filter(r => r.userId !== userId)
        this.allReminders.sweep(reminder => reminder?.userId == userId)
        this.reminders.sweep(reminder => reminder?.userId == userId)
        this.over32Bits.sweep(reminder => reminder?.userId == userId)
        return
    }

    async save(user, data) {
        new Database
            .Reminder(data)
            .save()
            .then(doc => {
                this.start(user, doc)
                return doc
            })
            .catch(err => err)
        return
    }

    async show(interaction, reminderId, toEdit) {

        const data = this.allReminders.get(reminderId)

        if (!data)
            return interaction.reply({
                content: `${e.Deny} | Lembrete não encontrado.`,
                ephemeral: true
            })

        let guild = await client.guilds.fetch(data.guildId, true).catch(() => null)

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
                        name: '⏳ Intervalo',
                        value: intervals[data.interval ?? 0]
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
                            description: 'Edite a mensagem e a hora que você definiu',
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

        return toEdit
            ? interaction.update(responseData).catch(() => { })
            : interaction.reply(responseData)
    }

    async move(interaction, reminderId) {

        const data = this.allReminders.get(reminderId)

        if (!data)
            return interaction.update({
                content: `${e.Deny} | Lembrete não encontrado.`,
                embeds: [], components: [], ephemeral: true
            }).catch(() => { })

        if (data.ChannelId === interaction.channel.id)
            return interaction.reply({
                content: `${e.Deny} | Este lembrete já está programado para disparar neste canal.`,
                ephemeral: true
            })

        return await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            {
                $set: { guildId: interaction.guild.id, ChannelId: interaction.channel.id }
            },
            { new: true }
        )
            .then(doc => {
                this.start(interaction.user, doc)
                return this.show(interaction, doc?.id, true)
            })
            .catch(err => {
                return interaction.update({
                    content: `${e.Deny} | Não foi possível editar este lembrete.\n${e.bug} | \`${err}\``,
                    embeds: [], components: []
                }).catch(() => { })
            })
    }

    async requestEdit(interaction, reminderId) {

        const reminder = this.allReminders.get(reminderId)

        if (!reminder)
            return interaction.update({
                content: `${e.Deny} | Lembrete não encontrado`,
                embeds: [], components: []
            }).catch(() => { })

        const date = Date.stringDate((reminder.DateNow + reminder.Time) - Date.now())
        const message = reminder.RemindMessage

        if (!date || !message)
            return interaction.update({
                content: `${e.Deny} | Lembrete não encontrado ou já disparado`,
                embeds: [], components: []
            }).catch(() => { })

        return interaction.showModal(Modals.ReminderEdit(date, message, reminderId))
    }

    async edit(interaction, reminderId) {

        const { fields } = interaction
        const RemindMessage = fields.getTextInputValue('message') || null
        const date = fields.getTextInputValue('date') || 0
        const Time = timeMs(date)

        if (!date)
            return interaction.reply({
                content: `${e.Deny} | O tempo dado não é válido. Atualização cancelada.`,
                ephemeral: true
            })

        if (!RemindMessage)
            return interaction.reply({
                content: `${e.Deny} | Mensagem não encontrada.`,
                ephemeral: true
            })

        const data = this.allReminders.get(reminderId)

        if (!data)
            return interaction.reply({
                content: `${e.DenyX} | Lembrete não encontrado.`,
                ephemeral: true
            })

        if (data.Time == Time && RemindMessage == data.RemindMessage)
            return interaction.reply({
                content: `${e.Deny} | Qual é, tá mesmo solicitando uma edição para editar a mesma coisa? Cancelei essa edição só por causa dos valores idênticos.`,
                ephemeral: true
            })

        if (date <= 3000)
            return interaction.reply({ content: `${e.Deny} | O tempo mínimo é 3 segundos.`, ephemeral: true })

        await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            { $set: { Time, RemindMessage, DateNow: Date.now() } },
            { new: true }
        )
            .then(doc => this.start(interaction.user, doc))

        return this.show(interaction, reminderId, true)
    }

    async snooze(message, reminderId) {

        const data = this.allReminders.get(reminderId)

        if (!data)
            return await message.edit({ content: `${e.Deny} | Lembrete não encontrado.` }).catch(() => { })

        return await Database.Reminder.findOneAndUpdate(
            { id: data.id },
            {
                $set: {
                    Time: 1000 * 60 * 10,
                    DateNow: Date.now(),
                    snoozed: true,
                    Alerted: false
                }
            },
            { new: true }
        )
            .then(doc => {
                this.start(data.userId, doc)
                return message.edit({
                    content: `${e.Check} | Ok ok! Lembrete adiado (+10 minutos).\n⏱️ | Nova hora de disparo: ${Date.GetTimeout(doc.Time, doc.DateNow, 'R')}`
                }).catch(() => { })
            })
            .catch(err => message.edit({ content: `${e.Deny} | Não foi possível adiar este lembrete.\n${e.bug} | \`${err}\`` }).catch(() => { }))

    }

    async refreshAllReminders() {

        const AllRemindersData = await Database.Reminder.find() || []

        for (const doc of AllRemindersData)
            this.allReminders.set(doc?.id, doc)

        setTimeout(() => this.refreshAllReminders(), 1000 * 60 * 5)
    }

}