import {
    SaphireClient as client,
    Database,
    Modals
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import searchAnime from "../../../commands/functions/anime/search.anime.js"

export default async (interaction, { src: customId }) => {

    const { message, user } = interaction

    if (customId === 'indicate') return await interaction.showModal(Modals.indicateAnime())

    if (customId === 'refresh') {

        const authorId = message.interaction.user.id
        if (user.id !== authorId) return

        const anime = Database.animeIndications.random()

        return await interaction.update({
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
            }]
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