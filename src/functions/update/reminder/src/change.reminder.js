import { ModalSubmitInteraction } from "discord.js"
import { socket } from "../../../../websocket/websocket.js"
import showReminder from "./show.reminder.js"
import timeMs from "../../../plugins/timeMs.js"
import { Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ModalSubmitInteraction } interaction
 * @param { string | undefined } reminderId
 */
export default async (interaction, reminderId) => {

    if (!reminderId) return

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

    const data = await socket?.timeout(1000)?.emitWithAck("getReminder", reminderId).catch(() => null)

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

    return await Database.Reminder.findOneAndUpdate(
        { id: reminderId },
        { $set: { Time, RemindMessage, DateNow: data.DateNow } },
        { new: true }
    )
        .then(doc => {

            if (!doc)
                return interaction.reply({
                    content: `${e.DenyX} | Lembrete não encontrado.`,
                    ephemeral: true
                })

            socket?.send({ type: "updateReminder", reminderData: doc.toObject() })
            return setTimeout(() => showReminder(interaction, reminderId, true, doc.toObject()), 700)
        })
            .catch(err => {
                return interaction.reply({
                    content: `${e.bug} | \`${err}\``,
                    ephemeral: true
                })
            })

}