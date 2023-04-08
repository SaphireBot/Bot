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

    const channelId = commandData[0].channelId
    const roleId = commandData[0].roleId
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

    const channelPermissions = channel.permissionsFor(client.user)
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

    const streamers = commandData.map(data => ({ streamer: data.streamer }))
    const toPushData = commandData.map(data => ({ channelId, streamer: data.streamer, roleId, message: data.message }))

    await Database.Guild.updateOne(
        { id: guild.id },
        {
            $pullAll: {
                TwitchNotifications: [streamers]
            }
        }
    )

    return Database.Guild.updateOne(
        { id: guild.id },
        { $push: { TwitchNotifications: { $each: toPushData } } }
    )
        .then(async () => {
            interaction.update({
                components: [],
                embeds: [{
                    color: client.blue,
                    title: `${e.twitch} ${client.user.username}'s Twitch System Notification`,
                    description: commandData.map(s => `${e.CheckV} [${s.username}](${`https://www.twitch.tv/${s.streamer}`})`).join('\n'),
                    fields: [
                        {
                            name: `${e.Info} Informações`,
                            value: `Canal de Notificação: ${channel} \`${channel.id}\`\nCargo: ${roleId ? `<@&${roleId}> \`${roleId}\`` : 'Nenhum'}\nMensagem Customizada: ${commandData[0].message ? commandData[0].message : `${e.Notification} **${commandData[0].streamer}** está em live na Twitch.`}`
                        },
                        {
                            name: `${e.Warn} Atenção`,
                            value: `*Não se esqueça! Posso demorar de 5 segundos a 10 minutos para enviar a notificação. Tudo depende de como a Twitch acordou hoje.*`
                        }
                    ],
                    footer: {
                        text: `${commandData.length} Streamers Autorizados`
                    }
                }]
            }).catch(() => { })

            for (const { streamer, oldChannelId, message, channelId } of commandData) {

                if (TwitchManager.data[streamer]?.includes(channelId))
                    TwitchManager.data[streamer] = TwitchManager.data[streamer]?.filter(id => id != oldChannelId)

                if (!TwitchManager.streamers.includes(streamer)) TwitchManager.streamers.push(streamer)
                if (!TwitchManager.data[streamer]) TwitchManager.data[streamer] = []

                TwitchManager.data[streamer].push(channelId)
                TwitchManager.channelsNotified[streamer] = TwitchManager.channelsNotified[streamer]?.filter(cId => ![channelId, oldChannelId, null].includes(cId)) || []
                await Database.Cache.General.set(`channelsNotified.${streamer}`, TwitchManager.channelsNotified[streamer])

                if (roleId)
                    TwitchManager.rolesIdMentions[`${streamer}_${channelId}`] = roleId

                if (message)
                    TwitchManager.customMessage[`${streamer}_${channelId}`] = message
            }

            return
        })
        .catch(err => interaction.update({
            content: `${e.cry} | Não foi possível salvar esta configuração.\n${e.bug} | \`${err}\``,
            components: [],
            ephemeral: true
        }).catch(() => { }))

}