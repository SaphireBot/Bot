import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from '../../../../../../util/util.js'
import { Database } from "../../../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { options, guild } = interaction

    await interaction.reply({ content: `${e.Loading} | Carregando...` })
    const data = await Database.getGuild(guild.id)

    if (!data.TwitchNotifications?.length)
        return interaction.editReply({
            content: `${e.DenyX} | Nenhum streamer está configurado neste servidor.`
        }).catch(() => { })

    let twitchChannelName = options.getString('streamer')

    if (twitchChannelName == 'disableAll')
        return interaction.editReply({
            content: `${e.QuestionMark} | Você realmente deseja desativar as notificações de **${data.TwitchNotifications?.length || 0} streamers** neste servidor?`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Desativar Tudo',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'twitch', cName: 'disableAll', t: 'd' }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: 'Manter Configuração',
                            emoji: e.CheckV,
                            custom_id: JSON.stringify({ c: 'delete' }),
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ]
        }).catch(() => { })

    if (twitchChannelName.includes('www.twitch.tv/')) {
        const url = twitchChannelName.split('/').at(-1)
        twitchChannelName = url
    }

    const notifications = data?.TwitchNotifications || []
    const hasConfig = notifications.find(tw => tw?.streamer == twitchChannelName)

    if (!hasConfig)
        return await interaction.editReply({
            content: `${e.DenyX} | Ups, parece que esse streamer não está configurado neste servidor.`,
            ephemeral: true
        }).catch(() => { })

    return interaction.editReply({
        content: `${e.QuestionMark} | Entendi. Você realmente tem certeza que quer cancelar as notificações do/a streamer **${twitchChannelName}** neste servidor? O canal configurado para este streamer é o <#${hasConfig?.channelId}> \`${hasConfig?.channelId || '0'}\`.`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Desativar',
                        emoji: e.Trash,
                        custom_id: JSON.stringify({ c: 'twitch', cName: twitchChannelName, cId: hasConfig.channelId, t: 'd' }),
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: 'Manter Configuração',
                        emoji: e.CheckV,
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Conferir Canal na Twitch',
                        emoji: '🔗',
                        url: `https://www.twitch.tv/${twitchChannelName}`,
                        style: ButtonStyle.Link
                    }
                ]
            }
        ]
    }).catch(() => { })

}