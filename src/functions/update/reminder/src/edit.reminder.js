import { StringSelectMenuInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { socket } from "../../../../websocket/websocket.js"
import { Modals } from "../../../../classes/index.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { string | undefined } reminderId
 */
export default async (interaction, reminderId) => {

    if (!reminderId)
        return interaction.update({
            content: `${e.DenyX} | O ID do lembrete não foi encontrado.`,
            components: [], embeds: []
        }).catch(() => { })

    const reminder = await socket?.timeout(1000)?.emitWithAck("getReminder", reminderId).catch(() => null)

    if (!reminder)
        return interaction.update({
            content: `${e.Deny} | Lembrete não encontrado`,
            embeds: [], components: []
        }).catch(() => { })

    const date = Date.stringDate((reminder?.DateNow + reminder?.Time) - Date.now())
    const message = reminder?.RemindMessage

    if (!date || !message || reminder?.Alerted)
        return interaction.update({
            content: `${e.Deny} | Lembrete não encontrado ou já disparado`,
            embeds: [], components: []
        }).catch(() => { })

    return interaction.showModal(Modals.ReminderEdit(date, message, reminderId))

}