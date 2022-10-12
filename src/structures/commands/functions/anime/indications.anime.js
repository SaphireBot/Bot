import { ButtonStyle } from "discord.js"
import { Database, Modals, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import showMyAnimes from "./my.anime.js"

export default async interaction => {

    const { options, user } = interaction
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
        case 'credits': showCreditsEmbed(); break;
        default:
            const index = animes.findIndex(an => an.name === option)
            showAnimesIndicates(index)
            break;
    }

    async function showAnimesIndicates(index) {
        const anime = index < 0 ? animes.random() : animes[index]
        const animeIndex = index < 0 ? animes.findIndex(an => an.name === anime.name) : index

        const buttons = [{
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
        }]

        if (client.admins.includes(user.id))
            buttons.push({
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Deletar anime',
                        emoji: e.Trash,
                        custom_id: JSON.stringify({ c: 'anime', src: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            })

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
                        name: '🏷️ Tags',
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
                ],
                footer: { text: `❤ Powered By ${client.user.username}'s Community` }
            }],
            components: buttons
        })
    }

    async function showCreditsEmbed() {

        const usersThatIndicate = []
        const people = [...client.staff, '648389538703736833', '395669252121821227', '140926143783108610']

        animes.map(ind => {
            if (!usersThatIndicate.includes(ind.authorId))
                usersThatIndicate.push(ind.authorId)

            if (!people.includes(ind.authorId))
                people.push(ind.authorId)

            return
        })
        //                                                                                      André      
        const betaTesters = [Database.Names.Gowther, Database.Names.Makol, Database.Names.San, '648389538703736833']
        //                    André                 Gorniack              Lewd
        const improviments = ['648389538703736833', '395669252121821227', '140926143783108610']

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: '❤ Créditos do comando Anime Indications',
                description: 'Agradecimento a todas as pessoas que participaram para que este comando fosse possível',
                fields: [
                    {
                        name: '💡 Idealizador',
                        value: resolve(Database.Names.Gowther) || 'Not Found - Gowther'
                    },
                    {
                        name: '⚙ Código Fonte',
                        value: resolve(Database.Names.Rody) || 'Not Found - Rody'
                    },
                    {
                        name: '⬆ Dicas e Melhorias',
                        value: improviments.map(userId => resolve(userId)).filter(i => i).join('\n') || 'Not Found'
                    },
                    {
                        name: `${e.Check} Verificação e Aprovação`,
                        value: client.staff.map(userId => resolve(userId)).filter(i => i).join('\n') || 'Not Found'
                    },
                    {
                        name: '🐥 Beta Testers',
                        value: betaTesters.map(userId => resolve(userId)).filter(i => i).join('\n') || 'Not Found'
                    },
                    {
                        name: '😎 Indicações',
                        value: usersThatIndicate.length ?
                            (() => {
                                return usersThatIndicate
                                    .map(userId => resolve(userId))
                                    ?.filter(i => i)
                                    ?.slice(0, 7)
                                    ?.join('\n')
                                    || 'Not Found\n'
                                    + `${usersThatIndicate.length - 7 > 1
                                        ? `\nE outros ${usersThatIndicate.length} usuários`
                                        : ''}`
                            })()
                            : 'Ninguém indicou nenhum anime ainda'
                    },
                    {
                        name: '🔎 Fontes e Pesquisas',
                        value: `A base para os gêneros e categorias foram vistas na [Crunchyroll](https://beta.crunchyroll.com/) e [AniList](https://anilist.co/search/anime) com uma ajudinha do poder de busca da [Kitsu](https://kitsu.io/explore/anime) para as informações.`
                    },
                    {
                        name: '👥 Participantes e Animes',
                        value: `Desde a ideia inicial, staff e todos que indicaram, chegamos a um total de ${people.length} pessoas que contribuiram para este comando chegar até aqui com uma quantia de ${animes.length} animes indicados.`
                    }
                ]
            }]
        })

        function resolve(userId) {
            const tag = client.users.resolve(userId)?.tag
            if (!tag) return null
            return `${tag || '\`Not Found\`'} - \`${userId}\``
        }
    }

    return
}