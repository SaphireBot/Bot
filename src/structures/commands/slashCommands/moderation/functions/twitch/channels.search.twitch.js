import { ButtonStyle, ChatInputCommandInteraction, PermissionsBitField, codeBlock, time } from "discord.js"
import { SaphireClient as client, TwitchManager } from "../../../../../../classes/index.js"
import { TwitchLanguages } from "../../../../../../util/Constants.js"
import { Emojis as e } from "../../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 * @param { {
 *       broadcaster_language: 'string',
 *       broadcaster_login: 'string',
 *       display_name: 'string',
 *       game_id: 'string',
 *       game_name: 'Just string',
 *       id: 'string',
 *       is_live: Boolean,
 *       tag_ids: Array,
 *       tags: Array,
 *       thumbnail_url: 'string',
 *       title: 'string',
 *       started_at: 'Date?'
 *   } } data
 */
export default async (interaction, resource) => {

    if (!resource?.length)
        return interaction.editReply({ content: `${e.DenyX} | Nenhum dado encontrado.` }).catch(() => { })

    const streamers = await TwitchManager.fetcher(`https://api.twitch.tv/helix/users?${resource.map(d => `login=${d.broadcaster_login}`).join('&')}`)

    if (streamers == 'TIMEOUT')
        return interaction.editReply({
            content: `${e.SaphireDesespero} |Aaaaah, o sistema da Twitch está pegando FOOOOGO 🔥\n🧑‍🚒 | Fica tranquilo, que tudo está normal em menos de 1 minuto. ||Rate limit é uma coisinha chata||`
        }).catch(() => { })

    const followers = await Promise.all(
        streamers.map(str => TwitchManager.getFollowers(str.id))
    )

    for (let i = 0; i < streamers.length; i++)
        streamers[i].followers = followers[i]

    const query = interaction.options.getString('input').toLowerCase()
    const onlines = resource.filter(d => d.is_live).sort((a, b) => b.followers - a.followers)
    const offlines = resource.filter(d => !d.is_live).sort((a, b) => b.followers - a.followers)
    const data = [...onlines, ...offlines]
    const queryIndex = data.findIndex(d => d.login == query)

    if (queryIndex >= 0) {
        const queryData = data[queryIndex]
        data.splice(queryIndex, 1)
        data.unshift(queryData)
    }

    const selectMenu = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'streamer',
            placeholder: 'Escolher um Streamer',
            options: []
        }]
    }

    const hasPerm = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    const result = data.map((d, i) => {

        const streamer = streamers.find(str => str.id == d.id)

        selectMenu.components[0].options.push({
            label: d.display_name,
            emoji: e.twitch,
            description: `${streamer?.description || 'Sem descrição'}`.slice(0, 100),
            value: `${i}`
        })

        const partner = { affiliate: '\n🧩 Afiliado da Twitch', partner: '\n🤝 Parceiro da Twitch' }[streamer?.broadcaster_type] || ''
        const url = `https://www.twitch.tv/${d.broadcaster_login}`
        const ms = new Date(streamer?.created_at)?.valueOf()
        const createdAt = `${time(new Date(ms), 'd')} ${time(new Date(ms), 'T')}`

        return {
            content: null,
            fetchReply: true,
            embeds: [{
                color: 0x9c44fb, // Twitch's Logo Purple
                title: `${e.twitch} Twitch Search Streamers System - ${i + 1}/${data.length}`,
                description: `**${d.display_name}** está na Twitch deste ${createdAt}\n${codeBlock('txt', streamer?.description || 'Sem descrição')}`,
                fields: [
                    {
                        name: `${e.Info} Informações Gerais`,
                        value: `🆔 \`${d?.id || 0}\`\n👁️‍🗨️ \`${(streamer?.view_count || 0).currency()}\` Visualizações${partner}\n💬 Idioma \`${TwitchLanguages[d.broadcaster_language] || d.broadcaster_language || 'Nenhum'}\`\n🏷️ Tags: \`${d.tags?.join(', ') || 'Nenhuma tag'}\`${d.is_live ? `\n🟢 [Ao Vivo](${url})` : '\n🔴 Não está ao vivo'}`
                    }
                ],
                thumbnail: {
                    url: d.thumbnail_url || null
                },
                footer: {
                    text: `${client.user.username}'s Twitch Notification System`,
                    icon_url: 'https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png',
                }
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: e.saphireLeft,
                            custom_id: 'left',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Canal da Twitch',
                            emoji: e.SaphirePipoca,
                            url,
                            style: ButtonStyle.Link
                        },
                        {
                            type: 2,
                            label: 'Ativar Notificação',
                            emoji: e.Notification,
                            custom_id: JSON.stringify({ c: 'twitch', src: 'active', streamer: d?.broadcaster_login }),
                            style: ButtonStyle.Success,
                            disabled: !hasPerm
                        },
                        {
                            type: 2,
                            emoji: e.saphireRight,
                            custom_id: 'right',
                            style: ButtonStyle.Primary
                        },
                    ]
                }
            ]
        }
    })

    for (let i = 0; i < result.length; i++)
        result[i].components.unshift(selectMenu)

    const message = await interaction.editReply(result[0]).catch(() => null)
    if (!message) return

    let index = 0
    return message.createMessageComponentCollector({
        filter: int => int.user.id === interaction.user.id,
        idle: 1000 * 60 * 3,
        errors: ['idle']
    })
        .on('collect', int => {

            const { customId } = int

            if (customId.includes('twitch')) return

            if (customId == 'streamer')
                index = Number(int.values[0])

            if (customId == 'right')
                result[index + 1] ? index++ : index = 0

            if (customId == 'left')
                result[index - 1] ? index-- : index = result.length - 1

            return int.update(result[index]).catch(() => { })

        })
        .on('end', (_, reason) => {

            if (['time', 'idle'].includes(reason))
                interaction.editReply({ components: [] }).catch(() => { })

            return
        })

}
