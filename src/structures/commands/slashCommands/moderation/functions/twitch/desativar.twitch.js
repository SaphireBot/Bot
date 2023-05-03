import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from '../../../../../../util/util.js'
import { Database } from "../../../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { options, guild } = interaction
    let twitchChannelName = options.getString('streamer')

    if (twitchChannelName.includes('www.twitch.tv/')) {
        const url = twitchChannelName.split('/').at(-1)
        twitchChannelName = url
    }

    // const data = await Database.Guild.findOne({ id: guild.id }, 'TwitchNotifications')
    const data = await Database.getGuild(guild.id)
    const notifications = data?.TwitchNotifications || []
    const hasConfig = notifications.find(tw => tw?.streamer == twitchChannelName)

    if (!hasConfig)
        return await interaction.reply({
            content: `${e.DenyX} | Ups, parece que esse streamer não está configurado neste servidor.`,
            ephemeral: true
        }).catch(() => { })

    return interaction.reply({
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
    })

}