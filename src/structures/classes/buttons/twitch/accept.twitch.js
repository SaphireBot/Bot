import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { PermissionFlagsBits, PermissionsBitField, ButtonInteraction } from "discord.js"
import { PermissionsTranslate } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"
import { socket } from "../../../../websocket/websocket.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', cName: TwitchChannelName, cgId: GuildTextChannelNotificationId } } commandData
 */
export default async (interaction, commandData) => {

    const channelId = commandData[0].channelId
    const roleId = commandData[0].roleId
    const { user, message, member, guild, guildId } = interaction

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
            content: `${e.Animated.SaphireCry} | Eu não tenho todas as permissões necessárias.\n${e.Info} | Permissões faltando: ${greenCard.map(perm => `\`${PermissionsTranslate[perm || perm]}\``).join(', ') || 'Nenhuma? WTF'}`,
            ephemeral: true
        }).catch(() => { })

    await interaction.update({
        content: `${e.Loading} | Salvando ${commandData.length == 1 ? 'streamer' : `${commandData.length} streamers`}...`, components: [], embeds: []
    }).catch(() => { })

    const toPushData = commandData.map(d => ({ channelId, streamer: d.streamer, roleId, message: d.message }))
    const guildData = await Database.getGuild(guildId)
    const streamersToSet = guildData.TwitchNotifications?.filter(d => !commandData.some(c => c.streamer == d.streamer)) || []
    streamersToSet.push(...toPushData)

    await Database.Guild.findOneAndUpdate(
        { id: guildId },
        { $set: { TwitchNotifications: streamersToSet } },
        { new: true }
    )
        .then(async data => {
            Database.saveGuildCache(data.id, data)

            for await (const { streamer, oldChannelId, message, channelId } of commandData) {

                socket?.send({
                    type: "updateManyStreamers",
                    updateManyTwitchStreamer: { streamer, oldChannelId, message, channelId }
                })
            }

            return interaction.message.edit({
                content: null,
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

        })
        .catch(err => {
            interaction.update({
                content: `${e.Animated.SaphireCry} | Não foi possível salvar esta configuração.\n${e.bug} | \`${err}\``,
                components: [],
                ephemeral: true
            }).catch(() => { })
            return console.log(err)
        })

}