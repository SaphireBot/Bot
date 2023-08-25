import { StringSelectMenuInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { socket } from "../../../../websocket/websocket.js"

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

    if (!socket?.connected)
        return interaction.update({
            content: `${e.Animated.SaphirePanic} | A socket não está conectada com a API... Pode tentar novamente?`,
            components: [], embeds: []
        }).catch(() => { })

    socket?.send({ type: "removeReminder", id: reminderId })

    return interaction.update({ content: `${e.CheckV} | Lembrete deletado com sucesso.`, embeds: [], components: [] }).catch(() => { })
}