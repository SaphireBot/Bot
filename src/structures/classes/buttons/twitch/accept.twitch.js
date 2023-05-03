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
            content: `${e.Animated.SaphireCry} | Eu não tenho todas as permissões necessárias.\n${e.Info} | Permissões faltando: ${greenCard.map(perm => `\`${PermissionsTranslate[perm || perm]}\``).join(', ') || 'Nenhuma? WTF'}`,
            ephemeral: true
        }).catch(() => { })

    await interaction.update({
        content: `${e.Loading} | Salvando ${commandData.length == 1 ? 'streamer' : `${commandData.length} streamers`}...`, components: [], embeds: []
    }).catch(() => { })

    const toPushData = commandData.map(d => ({ channelId, streamer: d.streamer, roleId, message: d.message }))
    // const guildData = await Database.Guild.findOne({ id: guild.id }, "TwitchNotifications")
    const guildData = await Database.getGuild(guild.id)
    const streamersToSet = guildData.TwitchNotifications?.filter(d => !commandData.some(c => c.streamer == d.streamer)) || []
    streamersToSet.push(...toPushData)

    await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $set: { TwitchNotifications: streamersToSet } },
        { new: true }
    )
        .then(async data => {
            Database.saveCacheData(data.id, data)
            TwitchManager.streamersOffline.push(...commandData.map(d => d.streamer))

            for await (const { streamer, oldChannelId, message, channelId } of commandData) {

                if (!TwitchManager.toCheckStreamers.includes(streamer)) TwitchManager.toCheckStreamers.push(streamer)
                if (!TwitchManager.streamers.includes(streamer)) TwitchManager.streamers.push(streamer)
                if (!TwitchManager.data[streamer]) TwitchManager.data[streamer] = []
                if (!TwitchManager.channelsNotified[streamer]) TwitchManager.channelsNotified[streamer] = []

                const index = TwitchManager.data[streamer].findIndex(cId => cId == oldChannelId)
                if (index >= 0) TwitchManager.data[streamer].splice(index, 1)
                TwitchManager.data[streamer].push(channelId)

                if (!TwitchManager.channelsNotified[streamer]) TwitchManager.channelsNotified[streamer] = []
                const indexNotified = TwitchManager.channelsNotified[streamer].findIndex(cId => cId == oldChannelId)
                if (indexNotified >= 0) TwitchManager.channelsNotified[streamer].splice(index, 1)

                await Database.Cache.General.pull(`channelsNotified.${streamer}`, cId => cId == oldChannelId)

                if (roleId)
                    TwitchManager.rolesIdMentions[`${streamer}_${channelId}`] = roleId

                if (message)
                    TwitchManager.customMessage[`${streamer}_${channelId}`] = message
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
            console.log(err)
            return interaction.update({
                content: `${e.Animated.SaphireCry} | Não foi possível salvar esta configuração.\n${e.bug} | \`${err}\``,
                components: [],
                ephemeral: true
            }).catch(() => { })
        })

}