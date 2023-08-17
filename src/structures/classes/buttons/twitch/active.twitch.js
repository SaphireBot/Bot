import { ButtonInteraction, PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { socket } from "../../../../websocket/websocket.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', src: 'active', streamer: streamerLogin } } commandData
 */
export default async (interaction, commandData) => {

    const { member, channelId, guildId, user, message } = interaction

    if (user.id !== message.interaction.user.id)
        return interaction.reply({
            content: `${e.Animated.SaphirePanic} | HEEY, você não pode clicar aqui, ok?`,
            ephemeral: true
        })

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Você precisa da permissão "Administrador" para adicionar notificações de streamers.`
        })

    const { streamer } = commandData
    await interaction.reply({ content: `${e.Loading} | Salvando o/a streamer **${streamer}** no servidor...` })

    const saving = await socket
        ?.timeout(2000)
        .emitWithAck("updateStreamer", { streamer, channelId, guildId })
        .catch(() => "error")

    const content = {
        already: `${e.Animated.SaphireReading} | De acordo o meu histórico, o/a streamer **${streamer}** já está configurado neste servidor.`,
        offline: `${e.Animated.SaphireReading} | O websocket não está conectado com o servidor, por tentar novamente?`,
        error: `${e.Animated.SaphirePanic} | Houve um erro na comunição entre as Websockets. Por favor, tente novamente daqui a pouco.`
    }[saving] || `${e.Animated.SaphireQuestion} | O universo conspirou contra nós e não foi possível o/a streamer **${streamer}** neste servidor.`

    if (saving !== "success")
        return interaction.editReply({ content }).catch(() => { })

    return interaction.editReply({ content: `${e.CheckV} | Ok ok, o/a streamer **${streamer}** foi salvo com sucesso.` }).catch(() => { })
}