import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { ButtonStyle } from "discord.js"

export default async interaction => {

    const { message, user } = interaction
    const authorId = message.interaction.user.id
    if (user.id !== authorId) return

    const animesFromDatabase = await Database.animeIndications() || []

    if (!animesFromDatabase || !animesFromDatabase.length)
        return await interaction.update({
            content: `${e.Deny} | Não há nenhum anime presente no banco de dados`,
            embeds: [],
            components: []
        }).catch(() => { })

    const { embeds } = message
    const embed = embeds[0]?.data
    const animeName = embed?.fields[0]?.value

    const allAnimes = animeName ? animesFromDatabase.filter(anime => anime.name !== animeName) : animesFromDatabase
    const anime = allAnimes.random()
    const animeIndex = allAnimes.findIndex(an => an.name === anime.name)

    if (!anime)
        return await interaction.update({
            content: `${e.Deny} | Nenhum outro anime foi encontrado.`
        })

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
                emoji: e.Animated.SaphireReading,
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
                label: anime?.up?.length || 0,
                emoji: e.Upvote,
                custom_id: JSON.stringify({ c: 'anime', src: 'up' }),
                style: ButtonStyle.Success
            },
            {
                type: 2,
                label: anime?.down?.length || 0,
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

    const categories = anime.category

    const tags = []

    if (!categories.length)
        tags.push({
            name: `${e.Deny} Tags`,
            value: 'Nenhuma tag foi definida'
        })

    if (categories.length > 25) {

        const divide = [categories.slice(0, 25), categories.slice(25, categories.length)]

        for (let cats of divide) {
            tags.push({
                name: '🏷️ Tags',
                value: cats?.map(cat => `\`${cat}\``)?.join(', ') || '\`Not Found\`'
            })
        }

    } else
        tags.push({
            name: '🏷️ Tags',
            value: categories?.map(cat => `\`${cat}\``)?.join(', ') || '\`Not Found\`'
        })

    return await interaction.update({
        content: null,
        embeds: [{
            color: client.blue,
            title: `💭 ${client.user.username}'s Indica Anime`,
            description: 'Todos os animes presentes neste comando foram sugeridos pelos próprios usuários e aprovados pela Administração da Saphire.',
            fields: [
                {
                    name: `📺 Anime - ${animeIndex + 1}/${animesFromDatabase.length}`,
                    value: anime.name
                },
                {
                    name: '🧩 Gêneros',
                    value: anime.gender?.map(gen => `\`${gen}\``)?.join(', ') || '\`Not Found\`'
                },
                ...tags,
                {
                    name: '👥 Público Alvo',
                    value: anime.targetPublic?.map(pub => `\`${pub}\``)?.join(', ') || '\`Not Found\`'
                },
                {
                    name: '👤 Sugerido por',
                    value: `${client.users.resolve(anime.authorId)?.username || 'Not Found'} - \`${anime.authorId}\``
                }
            ],
            footer: { text: `❤ Powered By ${client.user.username}'s Community` }
        }],
        components: buttons
    })

}