import { StringSelectMenuInteraction } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import { socket } from "../../../../websocket/websocket.js";

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

    const result = await socket?.timeout(1000)?.emitWithAck("moveReminder", { reminderId, guildId: interaction.guildId, channelId: interaction.channelId }).catch(() => "")

    if (result?.includes("error"))
        return interaction.update({
            content: `${e.Animated.SaphirePanic} | Erro ao mover o lembrete.\n${e.bug} | \`${result}\``,
            embeds: [], components: []
        }).catch(() => { })

    const content = {
        "Not Found": `${e.DenyX} | Lembrete não encontrado.`,
        "Same Channel": `${e.Info} | Os canais são os mesmos.`,
        "Error to save reminder": `${e.bug} | Erro ao salvar os dados no banco de dados.`,
        "Success": `${e.CheckV} | Lembrete movido com sucesso.`
    }[result] || `${e.Animated.SaphireReading} | Nenhum resposta obtida.`

    return interaction.update({ content, embeds: [], components: [] }).catch(() => { })
}