import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Byte, Emojis as e } from "../../../../../util/util.js"
import { SaphireClient as client } from "../../../../../classes/index.js"
const ratelimit = {
    remaining: 45,
    onLoad: false
}

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { options, user } = interaction
    const query = options.getString('anime_ou_personagem')
    query.toLowerCase().trim().replace(/\s/g, '%20')

    await interaction.reply({ content: `${e.Loading} | Carregando animes...` })

    if (ratelimit.onLoad)
        return interaction.reply({
            content: `${e.Loading} | Este sistema está sobre rate limit. Por favor, tente novamente daqui alguns segundos.`,
            ephemeral: true
        })

    ratelimit.remaining--
    return fetch(
        `https://wallhaven.cc/api/v1/search?q=${query}&sorting=views&categories=anime`,
        { method: 'GET' }
    )
        .then(async data => {
            ratelimit.remaining = Number(data.headers.get('x-ratelimit-remaining'))
            if (ratelimit.remaining <= 1) reload(data)
            if (ratelimit.remaining == 0)
                return interaction.reply({
                    content: `${e.Loading} | Este sistema está sobre rate limit. Por favor, tente novamente daqui alguns segundos.`,
                    ephemeral: true
                })
            return lauch(await data.json())
        })
        .catch(err => {
            console.log('searchAnime.wallpaper.js #Line42', err)
            return interaction.editReply({ content: `${e.SaphireDesespero} | Deu ruim aquiiii.\n${e.bug} | \`${err}\`` })
        })

    async function lauch(data) {
        if (!data)
            return interaction.editReply({ content: `${e.Deny} | Nenhum conteúdo foi encontrado.` }).catch(() => { })

        const source = data?.data

        if (!source.length)
            return interaction.editReply({
                content: `${e.Deny} | Nenhum wallpaper foi encontrado.`
            }).catch(() => { })

        const dataReply = source
            .filter(d => d.path?.length)
            .map((d, i) => ({
                content: null,
                embeds: [{
                    color: d.colors.length ? Number(d.colors.random().replace('#', '0x')) : client.blue,
                    title: `🖼️ ${client.user.username}'s Wallpaper Anime`,
                    url: d.url || null,
                    description: `🔎 Pesquisa \`${options.getString('anime_ou_personagem')}\`\n🎞️ Resolução de \`${d.resolution || '0x0'}\`\n💾 Tamanho de arquivo em \`${new Byte(d.file_size || 0)}\`\n👁‍🗨 Visto \`${d.views || 0}\` vezes\n🖌️ Cores ${d.colors?.map(str => `\`${str}\``)?.join(', ') || 'encontrada'}\n${e.Info} *Resolução da imagem reduzida para melhor desempenho. Acesse o site [clicando aqui](${d.url}) ou no botão para obter 100% da qualidade original.*`,
                    image: { url: `${d.thumbs?.large || null}` },
                    footer: {
                        text: `❤️ Powered by wallhaven | Wallpaper ID: ${d.id}`
                    }
                }],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                emoji: '⏮️',
                                custom_id: '00',
                                style: ButtonStyle.Primary,
                                disabled: i == 0
                            },
                            {
                                type: 2,
                                emoji: e.saphireLeft,
                                custom_id: `${i - 1}`,
                                style: ButtonStyle.Primary,
                                disabled: i == 0
                            },
                            {
                                type: 2,
                                emoji: e.Download,
                                url: `${d.url}`,
                                style: ButtonStyle.Link
                            },
                            {
                                type: 2,
                                emoji: e.saphireRight,
                                custom_id: `${i + 1}`,
                                style: ButtonStyle.Primary,
                                disabled: i == source.length - 1
                            },
                            {
                                type: 2,
                                emoji: '⏭️',
                                custom_id: `0${source.length - 1}`,
                                style: ButtonStyle.Primary,
                                disabled: i == source.length - 1
                            },
                        ]
                    }
                ]
            }))

        return interaction.editReply({ ...dataReply[0], fetchReply: true })
            .then(msg => {
                return msg.createMessageComponentCollector({
                    filter: int => int.user.id == user.id,
                    idle: 1000 * 60 * 30
                })
                    .on('collect', int => {
                        const { customId } = int
                        return int.update({ ...dataReply[Number(customId)] })
                    })
                    .on('end', (_, reason) => {
                        if (['limit', 'time', 'idle'].includes(reason))
                            return client.pushMessage({
                                method: 'patch',
                                channelId: interaction.channelId,
                                messageId: msg.id,
                                body: {
                                    components: []
                                }
                            })
                    })
            })
    }

    function reload(data) {
        if (ratelimit.remaining <= 1)
            if (!ratelimit.onLoad) {
                ratelimit.onLoad = true
                setTimeout(() => {
                    ratelimit.remaining = 45
                    return ratelimit.onLoad = false
                }, 1000 * Number(data.headers.get('retry-after')) || 55)
            }
    }
}