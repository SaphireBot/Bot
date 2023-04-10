import { ButtonInteraction, PermissionsBitField } from "discord.js"
import { TwitchManager } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', src: 'active', streamer: streamerLogin } } commandData
 */
export default async (interaction, commandData) => {

    const { member, channelId, guildId, user, message } = interaction

    if (user.id !== message.interaction.user.id)
        return interaction.reply({
            content: `${e.SaphireDesespero} | HEEY, você não pode clicar aqui, ok?`,
            ephemeral: true
        })

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Você precisa da permissão "Administrador" para adicionar notificações de streamers.`
        })

    const { streamer } = commandData
    const msg = await interaction.reply({
        content: `${e.Loading} | Salvando o/a streamer **${streamer}** no servidor...`,
        fetchReply: true
    })

    await TwitchManager.updateStreamer({ streamer, guildId, channelId })
    TwitchManager.streamersOffline.push(streamer)
    return msg.edit({ content: `${e.CheckV} | Ok ok, o/a streamer **${streamer}** foi salvo com sucesso.` })
}