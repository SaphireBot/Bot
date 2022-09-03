import {
    Database,
    SaphireClient as client
} from '../../../../classes/index.js'
import { ApplicationCommandOptionType } from 'discord.js'
import refreshRanking from '../../../../functions/update/ranking/index.ranking.js'

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
        },
        {
            name: 'options',
            description: 'Mais opções no comando ranking',
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ],
    helpData: {
        description: 'Aqui você pode conferir os diversos rankings inclusos no meu sistema'
    },
    async execute({ interaction, e }) {

        const { options, guild, user } = interaction
        const category = options.getString('category')
        const option = options.getString('options')

        if (option === 'refresh') {
            await interaction.reply({ content: `${e.Loading} | Iniciando atualização...` })
            await refreshRanking()
            return await interaction.editReply({ content: `${e.Check} | Ranking atualizado com sucesso.` })
        }

        const rankingData = await Database.Cache.Ranking.get(`Rankings.${category}`)

        if (!rankingData)
            return await interaction.reply({
                content: `${e.Deny} | Ranking não encontrado ou ainda não construído.`,
                ephemeral: true
            })

        const { query, embed } = rankingData

        const nextUpdate = await Database.Cache.General.get('updateTime')
        const moeda = await guild?.getCoin() || `${e.Coin} Safiras`
        const userRanking = query.findIndex(q => q.id === user.id) + 1 || '^2000'

        if (query.length > 10) query.length = 10

        const emojis = {
            Balance: moeda,
            Likes: '',
            Xp: ''
        }

        const format = query
            .map((query, i) => `**${query.tag ? top(i) : e.Deny} ${query.tag || '\`Not Found\`'} \`${query.id}\`**\n${query.emoji} ${query[category].currency()} ${emojis[category]}`)
            .join('\n \n')

        return await interaction.reply({
            embeds: [
                {
                    color: client.blue,
                    title: embed.title,
                    description: `⏱ Próxima atualização ${Date.Timestamp(new Date(nextUpdate || Date.now() + 60000 * 15), 'R', true)}\n \n${format.limit('MessageEmbedDescription')}`,
                    footer: { text: `Seu ranking: ${userRanking}` }
                }
            ]
        })

        function top(i) {
            return {
                0: e.CoroaDourada,
                1: e.CoroaDePrata,
                2: e.thirdcrown
            }[i] || `${i + 1}.`
        }
    }
}