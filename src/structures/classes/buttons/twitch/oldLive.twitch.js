import { ButtonStyle, time } from "discord.js"
import { ButtonInteraction, TwitchManager, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', src: 'clips', streamerId: streamerId } } commandData
 */
export default async (interaction, commandData) => {

    await interaction.reply({ content: `${e.Loading} | Buscando a live...`, ephemeral: true })

    const streamerVideos = await TwitchManager.fetcher(`https://api.twitch.tv/helix/videos?user_id=${commandData.streamerId}&first=25&type=archive`) || []

    if (streamerVideos == 'TIMEOUT')
        return interaction.editReply({
            content: `${e.SaphireDesespero} | Aaaaah, o sistema da Twitch está pegando FOOOOGO 🔥\n🧑‍🚒 | Fica tranquilo, que tudo está normal em menos de 1 minuto. ||Rate limit é uma coisinha chata||`
        }).catch(() => { })

    if (!streamerVideos.length)
        return interaction.editReply({ content: `${e.Animated.SaphireCry} | Eita... Eu não achei a live.` }).catch(() => { })

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'menu',
            placeholder: `👁️‍🗨️ Últimas ${streamerVideos.length} lives de ${streamerVideos[0].user_name}`,
            options: []
        }]
    }

    selectMenuObject.components[0].options = streamerVideos
        .map((data, i) => ({
            label: data.title,
            emoji: '🎬',
            description: `Duração de ${data.duration}`,
            value: `${i}`,
        }))

    const data = streamerVideos
        .map(data => ({
            content: null,
            embeds: [{
                color: 0x9c44fb,
                title: data.title,
                url: data.url,
                image: { url: data.thumbnail_url?.replace('%{width}x%{height}', '620x378') || null },
                description: `\n👥 ${(data.view_count || 0).currency()} pessoas assistiram\n🗓️ Transmitiu em ${time(new Date(data.published_at), 'f')}\n⏳ Durou um total de \`${data.duration?.replace('d', 'd ').replace('h', 'h ').replace('m', 'm ').trim()}\``,
                footer: {
                    text: `${client.user.username}'s Twitch Notification System`,
                    icon_url: 'https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png',
                }
            }],
            components: [
                selectMenuObject,
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Assistir na Twitch',
                            emoji: '🎬',
                            url: data.url,
                            style: ButtonStyle.Link
                        }
                    ]
                }
            ]
        }))

    return await interaction.editReply({ ...data[0], fetchReply: true })
        .then(msg => {
            return msg.createMessageComponentCollector({
                filter: int => int.user.id === interaction.user.id,
                idle: 1000 * 60 * 4
            })
                .on('collect', int => int.update(data[int.values[0]]))
                .on('end', () => msg.edit({ components: [] }).catch(() => { }))
        })
        .catch(() => { })

}