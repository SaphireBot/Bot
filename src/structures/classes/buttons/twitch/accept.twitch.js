import { PermissionFlagsBits, PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { SaphireClient as client, Database, TwitchManager } from "../../../../classes/index.js"
import { PermissionsTranslate } from "../../../../util/Constants.js"
import ButtonInteraction from "../../ButtonInteraction.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', cName: TwitchChannelName, cgId: GuildTextChannelNotificationId } } commandData
 */
export default async (interaction, commandData) => {

    const { streamer, channelId, roleId, message: customMessage } = commandData
    const { user, message, member, guild } = interaction

    if (user.id !== message.interaction.user.id)
        return interaction.reply({
            content: `${e.DenyX} | EPA EPA! Você não pode ativar isso aqui.`,
            ephemeral: true
        })

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Você precisa ser um **Administrador** do servidor para ativar as notificações da Twitch, ok?`,
            ephemeral: true
        })

    const channel = await guild.channels.fetch(channelId).catch(() => null)
    if (!channel)
        return interaction.update({
            content: `${e.DenyX} | O canal solicitado não foi encontrado.`,
            components: []
        })

    const channelPermissions = await channel.permissionsFor(client.user)
    const permissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
    const greenCard = Array.from(
        new Set([
            guild.members.me.permissions.missing(permissions),
            channelPermissions?.missing(permissions)
        ].flat())
    )

    if (greenCard.length)
        return interaction.update({
            content: `${e.cry} | Eu não tenho todas as permissões necessárias.\n${e.Info} | Permissões faltando: ${greenCard.map(perm => `\`${PermissionsTranslate[perm || perm]}\``).join(', ') || 'Nenhuma? WTF'}`,
            ephemeral: true
        }).catch(() => { })

    const data = await Database.Guild.findOne({ id: guild.id }, 'TwitchNotifications')
    const notifications = data?.TwitchNotifications || []
    const hasConfig = notifications.find(tw => tw?.streamer == streamer)

    if (
        hasConfig?.channelId == channel.id
        && hasConfig?.streamer == streamer
        && hasConfig?.roleId == roleId
        && hasConfig?.message == customMessage
    )
        return await interaction.update({
            content: `${e.DenyX} | Ueeepa. Eu vi aqui que o streamer **${streamer}** já está configurado neste servidor, acredita?\n${e.Notification} | Adivinha! Todas as configurações passadas são idênticas!`,
            components: []
        }).catch(() => { })

    if (hasConfig) {

        await Database.Guild.updateOne(
            { id: guild.id },
            {
                $pull: {
                    TwitchNotifications: { streamer: streamer }
                }
            }
        )

        TwitchManager.removeChannel(streamer, channelId)
        Database.Cache.General.push(`channelsNotified.${streamer}`, cId => cId == channelId)

        if (TwitchManager.channelsNotified[streamer]?.length)
            TwitchManager.channelsNotified[streamer].splice(
                TwitchManager.channelsNotified[streamer].findIndex(cId => cId == channelId), 1
            )
    }

    return Database.Guild.updateOne(
        { id: guild.id },
        {
            $addToSet: {
                TwitchNotifications: { channelId, streamer, roleId, message: customMessage }
            }
        }
    )
        .then(() => {
            interaction.update({
                content: `${e.Check} | YEEES! Tudo certo. De agora em diante, eu vou avisar no canal ${channel} sempre que o streamer **${streamer}** entrar em live${roleId ? ` e marcar o cargo <@&${roleId}>` : ''}, ok?\n${e.Warn} | Não se esqueça, posso demorar de 5 segundos a 10 minutos para enviar a notificação. Tudo depende de como a Twitch acordou hoje.`,
                components: []
            }).catch(() => { })

            if (!TwitchManager.streamers.includes(streamer)) TwitchManager.streamers.push(streamer)
            if (!TwitchManager.data[streamer]) TwitchManager.data[streamer] = []
            TwitchManager.data[streamer].push(channelId)

            if (roleId)
                TwitchManager.rolesIdMentions[`${streamer}_${channelId}`] = roleId

            if (customMessage)
                TwitchManager.customMessage[`${streamer}_${channelId}`] = customMessage

            return
        })
        .catch(err => interaction.update({
            content: `${e.cry} | Não foi possível salvar esta configuração.\n${e.bug} | \`${err}\``,
            components: [],
            ephemeral: true
        }).catch(() => { }))

}