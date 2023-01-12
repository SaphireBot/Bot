import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'
import translate from '@iamtraction/google-translate'
import lyrics from 'lyrics-parse'

export default {
    name: 'lyrics',
    description: '[util] Pesquise por letras de músicas',
    dm_permission: false,
    database: false,
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
    async execute({ interaction, client, e }) {

        const { options, user } = interaction
        const title = options.getString('title')
        const author = options.getString('author')
        let result = ''

        try {
            result = await lyrics(title, author)
            if (result)
                result = divide(result)
        } catch {
            result = null
        }

        if (!result && !author)
            return await interaction.reply({
                content: `${e.Deny} | Nenhuma letra de música foi encontrada.\n${e.Info} | Tente colocar o nome do artista/grupo/banda para melhorar a pesquisa.`,
                ephemeral: true
            })

        if (!result || !result?.length)
            return await interaction.reply({
                content: `${e.Deny} | Nenhuma letra de música foi encontrada com os valores repassados.`,
                ephemeral: true
            })

        const embeds = []
        for (let str of result)
            embeds.push({
                color: client.blue,
                title: `🎶 Letras de Músicas - ${client.user.username}`,
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
                            style: ButtonStyle.Primary,
                            disabled: embeds.length === 1
                        },
                        {
                            type: 2,
                            label: 'Seguinte',
                            custom_id: 'right',
                            style: ButtonStyle.Primary,
                            disabled: embeds.length === 1
                        },
                        {
                            type: 2,
                            label: 'Traduzir',
                            emoji: e.Translate,
                            custom_id: 'translate',
                            style: ButtonStyle.Primary
                        }
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

                if (customId === 'translate')
                    return translateMusic(int)

                if (customId === 'translate_original')
                    return translateMusic(int, true)

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
            .on('end', async () => await msg.edit({ components: [] }).catch(() => { }))

        async function translateMusic(int, originalMusic) {

            const text = embeds[index].description

            if (originalMusic)
                return await int.update({
                    embeds: [embeds[index]],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: 'Anterior',
                                    custom_id: 'left',
                                    style: ButtonStyle.Primary,
                                    disabled: embeds.length === 1
                                },
                                {
                                    type: 2,
                                    label: 'Seguinte',
                                    custom_id: 'right',
                                    style: ButtonStyle.Primary,
                                    disabled: embeds.length === 1
                                },
                                {
                                    type: 2,
                                    label: 'Traduzir',
                                    emoji: e.Translate,
                                    custom_id: 'translate',
                                    style: ButtonStyle.Primary
                                }
                            ]
                        }
                    ]
                }).catch(() => { })

            return translate(text, { to: 'pt' })
                .then(async res => {

                    if (res.from.language.iso === 'pt') {

                        await int.update({
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            label: 'Anterior',
                                            custom_id: 'left',
                                            style: ButtonStyle.Primary,
                                            disabled: embeds.length === 1
                                        },
                                        {
                                            type: 2,
                                            label: 'Seguinte',
                                            custom_id: 'right',
                                            style: ButtonStyle.Primary,
                                            disabled: embeds.length === 1
                                        },
                                        {
                                            type: 2,
                                            label: 'Traduzir',
                                            custom_id: 'translate',
                                            emoji: e.Translate,
                                            style: ButtonStyle.Primary,
                                            disabled: true
                                        }
                                    ]
                                }
                            ]
                        }).catch(() => { })

                        return await int.followUp({
                            content: `${e.Check} | Esta música já está em português.`,
                            ephemeral: true
                        })
                    }

                    return await int.update({
                        embeds: [{
                            color: client.blue,
                            title: `🎶 Letras de Músicas - ${client.user.username}`,
                            description: res.text.limit('MessageEmbedDescription'),
                            fields: [
                                {
                                    name: `${e.Info} | Dados Fornecidos`,
                                    value: `Autor: ${author || 'Nenhum Autor'}\nNome da Música: ${title}`.limit('MessageEmbedFieldValue')
                                }
                            ],
                            footer: {
                                text: '❤ Powered By Google'
                            }
                        }],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: 'Anterior',
                                        custom_id: 'left',
                                        style: ButtonStyle.Primary,
                                        disabled: embeds.length === 1
                                    },
                                    {
                                        type: 2,
                                        label: 'Seguinte',
                                        custom_id: 'right',
                                        style: ButtonStyle.Primary,
                                        disabled: embeds.length === 1
                                    },
                                    {
                                        type: 2,
                                        label: 'Letra Original',
                                        emoji: e.Translate,
                                        custom_id: 'translate_original',
                                        style: ButtonStyle.Primary
                                    }
                                ]
                            }
                        ]
                    }).catch(() => { })
                })
                .catch(async err => await int.reply({
                    content: `${e.Warn} | Não foi possível traduzir esta música\n${e.bug} | \`${err}\``
                }))
        }

        function divide(lyrics) {
            if (!lyrics) return []
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