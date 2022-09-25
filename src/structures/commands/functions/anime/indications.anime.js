import { ButtonStyle } from "discord.js"
import { Database, Modals, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import showMyAnimes from "./my.anime.js"

export default async interaction => {

    const { options } = interaction
    const option = options.getString('search') || options.getString('more_options')
    if (option === 'indicate') return await interaction.showModal(Modals.indicateAnime())

    const animes = await Database.animeIndications() || []
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

    switch (option) {
        case 'myAnimes': showMyAnimes(interaction); break;
        default:
            const index = animes.findIndex(an => an.name === option)
            showAnimesIndicates(index)
            break;
    }

    async function showAnimesIndicates(index) {
        const anime = index < 0 ? animes.random() : animes[index]
        const animeIndex = index < 0 ? animes.findIndex(an => an.name === anime.name) : index

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `💭 ${client.user.username}'s Indica Anime`,
                description: 'Todos os animes presentes neste comando foram sugeridos pelos próprios usuários e aprovados pela Administração da Saphire.',
                fields: [
                    {
                        name: `Anime - ${animeIndex + 1}/${animes.length}`,
                        value: anime.name
                    },
                    {
                        name: '🧩 Gêneros',
                        value: anime.gender?.map(gen => `\`${gen}\``)?.join(', ') || '\`Not Found\`'
                    },
                    {
                        name: '🎞 Categorias',
                        value: anime.category?.map(cat => `\`${cat}\``)?.join(', ') || '\`Not Found\`'
                    },
                    {
                        name: '👥 Público Alvo',
                        value: anime.targetPublic?.map(pub => `\`${pub}\``)?.join(', ') || '\`Not Found\`'
                    },
                    {
                        name: '👤 Sugerido por',
                        value: `${client.users.resolve(anime.authorId)?.tag || 'Not Found'} - \`${anime.authorId}\``
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
                            label: 'Indicar',
                            emoji: e.saphireLendo,
                            custom_id: JSON.stringify({ c: 'anime', src: 'indicate' }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Informações',
                            emoji: '🔎',
                            custom_id: JSON.stringify({ c: 'anime', src: 'info' }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: anime.up?.length || 0,
                            emoji: e.Upvote,
                            custom_id: JSON.stringify({ c: 'anime', src: 'up' }),
                            style: ButtonStyle.Success
                        },
                        {
                            type: 2,
                            label: anime.down?.length || 0,
                            emoji: e.DownVote,
                            custom_id: JSON.stringify({ c: 'anime', src: 'down' }),
                            style: ButtonStyle.Danger
                        }
                    ]
                }
            ]
        })
    }

    return
}