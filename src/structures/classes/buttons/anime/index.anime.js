import {
    SaphireClient as client,
    Database,
    Modals
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { ButtonStyle } from "discord.js"
import searchAnime from "../../../commands/functions/anime/search.anime.js"

export default async (interaction, { src: customId }) => {

    const { message, user } = interaction

    if (customId === 'indicate') return await interaction.showModal(Modals.indicateAnime())

    if (customId === 'refresh') {

        const authorId = message.interaction.user.id
        if (user.id !== authorId) return

        const allAnimes = Database.animeIndications
        const anime = allAnimes.random()
        const animeIndex = allAnimes.findIndex(an => an.name === anime.name)

        return await interaction.update({
            embeds: [{
                color: client.blue,
                title: `💭 ${client.user.username}'s Indica Anime`,
                description: 'Todos os animes presentes neste comando foram sugeridos pelos próprios usuários e aprovados pela Administração da Saphire.',
                fields: [
                    {
                        name: `Anime - ${animeIndex + 1}/${allAnimes.length}`,
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
                            label: anime.up || 0,
                            emoji: e.Upvote,
                            custom_id: JSON.stringify({ c: 'anime', src: 'up' }),
                            style: ButtonStyle.Success,
                            disabled: true
                        },
                        {
                            type: 2,
                            label: anime.down || 0,
                            emoji: e.DownVote,
                            custom_id: JSON.stringify({ c: 'anime', src: 'down' }),
                            style: ButtonStyle.Danger,
                            disabled: true
                        }
                    ]
                }
            ]
        }).catch(() => { })
    }

    if (customId === 'info') {

        const { embeds } = message
        const embed = embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            })

        const animeName = embed.fields[0]?.value

        if (!animeName)
            return await interaction.update({
                content: `${e.Deny} | Nome do anime não encontrado.`,
                components: []
            })

        return searchAnime(interaction, animeName)
    }

}