import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import fetch from 'node-fetch'

export default {
    name: 'lyrics',
    description: '[util] Pesquise por letras de músicas',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'title',
            description: 'Nome da música',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'author',
            description: 'Artista, grupo ou banda que fez/fizeram a música',
            type: ApplicationCommandOptionType.String
        }
    ],
    helpData: {
        description: 'Pesquise por letras de música',
    },
    async execute({ interaction, client }) {

        const { options, user } = interaction
        const title = options.getString('title')
        const author = options.getString('author')
        const result = await parse(title, author).catch(() => null)

        if (!result && !author)
            return await interaction.reply({
                content: `${e.Deny} | Nenhuma letra de música foi encontrada.\n${e.Info} | Tente colocar o nome do artista/grupo/banda para melhorar a pesquisa.`,
                ephemeral: true
            })

        if (!result)
            return await interaction.reply({
                content: `${e.Deny} | Nenhuma letra de música foi encontrada com os valores repassados.`,
                ephemeral: true
            })

        const embeds = []
        for (let str of result)
            embeds.push({
                color: client.blue,
                title: '🎶 Letras de Músicas',
                description: str[0].limit('MessageEmbedDescription'),
                fields: [
                    {
                        name: `${e.Info} | Dados Fornecidos`,
                        value: `Autor: ${author || 'Nenhum Autor'}\nNome da Música: ${title}`.limit('MessageEmbedFieldValue')
                    }
                ],
                footer: {
                    text: '❤ Powered By Google'
                }
            })

        if (!embeds.length)
            return await interaction.reply({
                content: `${e.Deny} | Montagem de embed mal sucedida.`,
                ephemeral: true
            })

        if (!embeds[1])
            return await interaction.reply({ embeds })

        const msg = await interaction.reply({
            embeds: [embeds[0]],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Anterior',
                            custom_id: 'left',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Seguinte',
                            custom_id: 'right',
                            style: ButtonStyle.Primary
                        },
                    ]
                }
            ],
            fetchReply: true
        })

        let index = 0
        return msg.createMessageComponentCollector({
            filter: int => int.user.id === user.id,
            idle: 120000, // 2 Minutos
            errors: ['idle']
        })
            .on('collect', async int => {

                const { customId } = int

                if (customId === 'left') {
                    index--
                    if (!embeds[index]) index = embeds.length - 1
                }

                if (customId === 'right') {
                    index++
                    if (!embeds[index]) index = 0
                }

                return await int.update({ embeds: [embeds[index]] }).catch(() => { })
            })
            .on('end', async () => {
                return await msg.edit({ components: [] }).catch(() => { })
            })


        async function parse(title = "", author = "") {
            if (!title && !author)
                return null

            const delimiter1 = '</div></div></div></div><div class="hwc"><div class="BNeawe tAd8D AP7Wnd"><div><div class="BNeawe tAd8D AP7Wnd">';
            const delimiter2 = '</div></div></div></div></div><div><span class="hwc"><div class="BNeawe uEec3 AP7Wnd">';
            const url = "https://www.google.com/search?q=";
            let lyrics;

            try {
                lyrics = await fetch(`${url}${encodeURIComponent(author + " " + title)}+lyrics`);
                lyrics = await lyrics.textConverted();
                [, lyrics] = lyrics.split(delimiter1);
                [lyrics] = lyrics.split(delimiter2);
            } catch (e) {
                try {
                    lyrics = await fetch(`${url}${encodeURIComponent(author + " " + title)}+song+lyrics`);
                    lyrics = await lyrics.textConverted();
                    [, lyrics] = lyrics.split(delimiter1);
                    [lyrics] = lyrics.split(delimiter2);
                } catch {
                    try {
                        lyrics = await fetch(`${url}${encodeURIComponent(author + " " + title)}+song`);
                        lyrics = await lyrics.textConverted();
                        [, lyrics] = lyrics.split(delimiter1);
                        [lyrics] = lyrics.split(delimiter2);
                    } catch {
                        try {
                            lyrics = await fetch(`${url}${encodeURIComponent(author + " " + title)}`);
                            lyrics = await lyrics.textConverted(); // Convert to text
                            [, lyrics] = lyrics.split(delimiter1); // Split it by the first delimiter
                            [lyrics] = lyrics.split(delimiter2); // Split it by the second delimiter
                        } catch {
                            lyrics = ''; // Give up, couldn't find lyrics
                        }
                    }
                }
            }

            if (!lyrics) return null
            const strings = []

            if (lyrics.length < 4096) {
                strings.push([lyrics])
                return strings
            }

            for (let i = 0; i <= lyrics.length; i += 4096) {
                if (lyrics.length <= (i + 4096)) {
                    strings.push([lyrics.slice(i, lyrics.length)])
                    break;
                }

                strings.push([`${lyrics.slice(i, 4096)}...`])
            }


            return strings
        }
    }
}