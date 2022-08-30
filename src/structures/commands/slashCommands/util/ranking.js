import {
    Database,
    SaphireClient as client
} from '../../../../classes/index.js'
import { ApplicationCommandOptionType } from 'discord.js'

export default {
    name: 'ranking',
    description: '[util] Um simples sistema de ranking',
    type: 1,
    options: [
        {
            name: 'category',
            description: 'categoria',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Balance',
                    value: 'Balance'
                },
                {
                    name: 'Likes',
                    value: 'Likes'
                },
                {
                    name: 'Experiência',
                    value: 'Xp'
                }
            ]
        }
    ],
    helpData: {
        description: 'Aqui você pode conferir os diversos rankings inclusos no meu sistema'
    },
    async execute({ interaction, e }) {

        const { options, guild, user } = interaction
        const category = options.getString('category')
        const { query, embed } = await Database.Cache.Ranking.get(`Rankings.${category}`)
        const nextUpdate = await Database.Cache.General.get('updateTime')
        const moeda = await guild?.getCoin() || `${e.Coin} Safiras`
        const userRanking = query.findIndex(q => q.id === user.id) || '^2000'

        if (query.length > 10) query.length = 10

        const emojis = {
            Balance: moeda,
            Likes: '',
            Xp: ''
        }

        const format = query
            .map((query, i) => `**${top(i)} ${query.tag} \`${query.id}\`**\n${query.emoji} ${query[category]} ${emojis[category]}`)
            .join('\n \n')

        return await interaction.reply({
            embeds: [
                {
                    color: client.blue,
                    title: embed.title,
                    description: `⏱ Próxima atualização ${Date.Timestamp(nextUpdate, 'R')}\n \n${format.limit('MessageEmbedDescription')}`,
                    footer: { text: `Seu ranking: ${userRanking}` }
                }
            ]
        })

        function top(i) {
            return {
                0: e.CoroaDourada,
                1: e.CoroaDePrata,
                2: e.thirdcrown
            }[i] || `${i + 1}`
        }
    }
}