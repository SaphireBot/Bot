import { ButtonStyle, ChatInputCommandInteraction, PermissionsBitField, time } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"
import { TwitchManager } from "../../../../../../classes/index.js"
import { TwitchLanguages } from "../../../../../../util/Constants.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { options, user, member, channel } = interaction
    const langRequest = options.getString('idioma')
    const lang = langRequest ? `&language=${langRequest}` : ''
    const amount = options.getInteger('quantidade') || 100

    const message = await interaction.reply({ content: `${e.Loading} | Buscando os streamers que você pediu.`, fetchReply: true })

    const data = await TwitchManager.fetcher(`https://api.twitch.tv/helix/streams?type=live&first=${amount}${lang}`)

    if (!data.length)
        return interaction.editReply({
            content: `${e.SaphireDesespero} | Eu não encontrei nenhum streamer online ${e.cry}`
        }).catch(() => { })

    const hasPerm = member.permissions.has(PermissionsBitField.Flags.Administrator)
    const streamersData = await TwitchManager.fetcher(`https://api.twitch.tv/helix/users?${data.map(d => `login=${d.user_login}`).join('&')}`)

    const responseData = data.map((d, i) => {

        const streamer = streamersData.find(str => str.login == d.user_login)
        const game = d.game_name ? `${d.game_name} \`${d.game_id}\`` : 'Nenhum jogo foi definido'
        const avatar = streamer.profile_image_url || null
        const viewers = `\`${d.viewer_count?.currency() || 0}\``
        const imageUrl = d.thumbnail_url?.replace('{width}x{height}', '620x378') || null
        const url = `https://www.twitch.tv/${streamer.login}`
        const date = new Date(d.started_at)

        return {
            content: null,
            embeds: [{
                color: 0x9c44fb, /* Twitch's Logo Purple */
                title: `${e.twitch} Streamers Online - ${i + 1}/${data.length}`,
                url,
                thumbnail: { url: avatar || null },
                description: `📺 Transmitindo **${game}**\n👥 ${viewers} pessoas assistindo agora`,
                image: { url: imageUrl || null },
                fields: [
                    {
                        name: `${e.Info} Informações Gerais`,
                        value: `🆔 **${d.user_name}** \`${d?.user_id || 0}\`\n⏳ Está online ${time(date, 'R')}\n👁️‍🗨️ \`${(streamer?.view_count || 0).currency()}\` Visualizações\n💬 Idioma \`${TwitchLanguages[d.language] || 'Não Definido'}\`\n🏷️ Tags: \`${d.tags?.join(', ') || 'Nenhuma tag'}\`\n🟢 [Ao Vivo | ${d.title}](${`https://www.twitch.tv/${d.user_login}`})`.limit('MessageEmbedFieldValue')
                    },
                    {
                        name: '🔎 Parametro de Busca',
                        value: `💬 Idioma: ${lang ? TwitchLanguages[langRequest] : "Todos"}`
                    }
                ],
                footer: {
                    text: `${data.length}/${amount} Streamers`
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
                            custom_id: JSON.stringify({ c: 'twitch', src: 'active', streamer: streamer.login }),
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

    return interaction.editReply(responseData[0])
        .then(() => initCollector())
        .catch(err => channel.send({ content: `${e.SaphireDesespero} | Deu ruim aquiii\n${e.bug} | \`${err}\`` }))

    function initCollector() {
        let index = 0
        const collector = message.createMessageComponentCollector({
            filter: int => int.user.id === user.id,
            idle: 1000 * 60 * 3,
            errors: ['idle']
        })
            .on('collect', int => {
                const { customId } = int
                if (customId.includes('{')) return
                if (customId == 'right') responseData[index + 1] ? index++ : index = 0
                if (customId == 'left') responseData[index - 1] ? index-- : index = responseData.length - 1
                return int.update(responseData[index]).catch(() => collector.stop())
            })
            .on('end', (_, reason) => {
                if (['time', 'idle', 'user'].includes(reason))
                    message.edit({ components: [] }).catch(() => { })
                return
            })
        return

    }
}