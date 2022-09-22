import { ButtonStyle } from "discord.js"
import { Database, Modals, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const animes = Database.animeIndications || []

    if (!animes || !animes.length)
        return await interaction.reply({
            content: `${e.Deny} | Não existe nenhum anime para ser indicado ainda.`,
            ephemeral: true,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Indicar um anime',
                        emoji: e.saphireLendo,
                        custom_id: JSON.stringify({ c: 'anime', src: 'indicate' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }]
        })

    const { options } = interaction
    const option = options.getString('more_options')

    if (!option) {
        const anime = animes.random()

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `💭 ${client.user.username}'s Indica Anime`,
                description: 'Todos os animes presentes neste comando foram sugeridos pelos próprios usuários e aprovados pela Administração da Saphire.',
                fields: [
                    {
                        name: 'Anime',
                        value: anime.name
                    },
                    {
                        name: 'Dados',
                        value: `Categoria: \`${anime.category}\`\nSugerido por: \`${client.users.resolve(anime.authorId)?.tag || 'Not Found'}\``
                    }
                ]
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Atualizar',
                            emoji: '🔄',
                            custom_id: JSON.stringify({ c: 'anime', src: 'refresh' }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Indicar um anime',
                            emoji: e.saphireLendo,
                            custom_id: JSON.stringify({ c: 'anime', src: 'indicate' }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Ver Informações',
                            emoji: '🔎',
                            custom_id: JSON.stringify({ c: 'anime', src: 'info' }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        })
    }

    if (option === 'indicate') return await interaction.showModal(Modals.indicateAnime())

    return await interaction.reply({
        content: `${e.Loading} | Comando em construção.`,
        ephemeral: true
    })
}