import { AnimeWallpaper } from "anime-wallpapers"
import { ButtonStyle, ChatInputCommandInteraction, ButtonInteraction } from "discord.js";
import { Emojis as e } from '../../../../../util/util.js'
import { SaphireClient as client } from "../../../../../classes/index.js";
const wall = new AnimeWallpaper();

/**
 * @param { ChatInputCommandInteraction | ButtonInteraction } interaction
 * @param { Boolean | undefined } isRefresh
 * @param { String | undefined } searchResource
 */
export default async function execute(interaction, isRefresh, searchResource) {

    const { options } = interaction
    const message = await interaction[isRefresh ? 'update' : 'reply']({ content: `${e.Loading} | Carregando wallpapers...`, fetchReply: true, components: [] })
    const search = isRefresh ? searchResource : options.getString('pesquisar')
    const wallpapers = await wall.getAnimeWall2(search).catch(() => null)
    const refresh = (int, search) => execute(int, true, search)

    if (!wallpapers || !wallpapers.length)
        return message.edit({
            content: `${e.cry} | Nenhum wallpaper de anime foi encontrado.`,
            ephemeral: true
        }).catch(() => { })


    if (wallpapers.length > 25) wallpapers.length = 25

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'menu',
            placeholder: 'Escolher Wallpaper',
            options: []
        }]
    }

    const embedAndComponent = EmbedGenerator()
    let control = 0

    return message.edit({
        content: null,
        embeds: [embedAndComponent[0].embed],
        components: [selectMenuObject, ...embedAndComponent[0].components]
    })
        .then(() => pagination())
        .catch(err => message.edit({
            content: `${e.SaphireDesespero} | Não foi possível concluir a mensagem.\n${e.bug} | \`${err}\``
        }).catch(() => { }))

    function pagination() {

        const collector = message.createMessageComponentCollector({
            filter: int => int.user.id == interaction.user.id,
            idle: 1000 * 60 * 2
        })
            .on('collect', int => {

                if (int.customId == 'refresh') {
                    collector.stop()
                    return refresh(int, search)
                }

                if (int.values) {
                    control = Number(int.values[0])
                } else
                    int.customId == 'left'
                        ? embedAndComponent[control - 1] ? control-- : control = embedAndComponent.length - 1
                        : embedAndComponent[control + 1] ? control++ : control = 0

                return int.update({
                    embeds: [embedAndComponent[control].embed],
                    components: [selectMenuObject, ...embedAndComponent[control].components],
                }).catch(() => { })

            })
            .on('end', (_, reason) => {

                if (['limit', 'idle', 'time'].includes(reason)) {
                    const embed = embedAndComponent[control].embed
                    embed.color = client.red
                    embed.footer = { text: embed.footer.text + ' | Tempo Expirado' }
                    return message.edit({ embeds: [embed], components: [], }).catch(() => { })
                }

                if (reason == 'messageDelete')
                    return interaction.channel.send({ content: `${e.saphireRight} | Qual foi? Apaga a mensagem não coisa ruim.` }).catch(() => { })

                return
            })

        return
    }

    function EmbedGenerator() {

        const allData = []

        // const { title, image } = wallpapers
        for (let i = 0; i <= wallpapers.length; i++) {
            const data = wallpapers[i]
            if (!data) continue
            selectMenuObject.components[0].options.push({
                label: data.title.slice(0, 50),
                emoji: '🖼️',
                value: `${i}`,
            })
            allData.push({
                embed: {
                    color: client.blue,
                    title: `🖼️ Anime Wallpaper Seacher - ${i + 1}/${wallpapers.length}`,
                    description: `🔎 \`${search}\`\n🏷️ ${data.title || 'Title Not Found'}`.limit('MessageEmbedDescription'),
                    image: { url: data.image },
                    footer: {
                        text: '❤️ Powered By: anime-wallpapers'
                    }
                },
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Pra cá',
                                emoji: e.saphireLeft,
                                style: ButtonStyle.Primary,
                                custom_id: 'left'
                            },
                            {
                                type: 2,
                                label: 'Wallpaper',
                                emoji: '🔗',
                                style: ButtonStyle.Link,
                                url: data.image
                            },
                            {
                                type: 2,
                                label: 'Pra lá',
                                emoji: e.saphireRight,
                                style: ButtonStyle.Primary,
                                custom_id: 'right'
                            },
                            {
                                type: 2,
                                label: 'Atualizar',
                                emoji: '🔄',
                                style: ButtonStyle.Primary,
                                custom_id: 'refresh'
                            },
                        ]
                    }
                ]
            })
        }

        if (selectMenuObject.components[0].options.length > 25)
            selectMenuObject.components[0].options.length = 25

        return allData
    }

}