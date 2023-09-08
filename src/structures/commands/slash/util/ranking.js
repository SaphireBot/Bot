import { Database, SaphireClient as client } from '../../../../classes/index.js'
import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js'
import refreshRanking from '../../../../functions/update/ranking/index.ranking.js'
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js'

export default {
    name: 'ranking',
    description: '[util] Um simples sistema de ranking',
    category: "util",
    dm_permission: false,
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
                    value: 'Level'
                },
                {
                    name: 'Logomarca Game',
                    value: 'GamingCount.Logomarca'
                },
                {
                    name: 'Bandeiras Quiz',
                    value: 'GamingCount.FlagCount'
                },
                {
                    name: 'Quiz Anime',
                    value: 'GamingCount.QuizAnime'
                },
                {
                    name: 'Quiz Perguntas',
                    value: 'GamingCount.QuizQuestions'
                },
                {
                    name: 'Sequência do Daily',
                    value: 'DailyCount'
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
    apiData: {
        name: "ranking",
        description: "Um grande sistema incluindo todos os rankings de todos os lugares da Saphire",
        category: "Utilidades",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e }) {

        const { options, guild, user } = interaction
        const category = options.getString('category')
        const option = options.getString('options')

        if (option === 'refresh') {

            if (!client.admins.includes(user.id))
                return await interaction.reply({
                    content: `${e.DenyX} | Para para para, isso aqui é só para os meus Administradores.`,
                    ephemeral: true
                })

            await interaction.reply({ content: `${e.Loading} | Iniciando atualização...` })
            await refreshRanking()
            return await interaction.editReply({ content: `${e.Check} | Ranking atualizado com sucesso.` }).catch(() => { })
        }

        const rankingData = await Database.Cache.Ranking.get(`Rankings.${category}`)
        if (option == 'script') return buildScriptAndSend(rankingData)

        if (!rankingData)
            return await interaction.reply({
                content: `${e.Deny} | Ranking não encontrado ou ainda não construído.`,
                ephemeral: true
            })

        let { query, embed } = rankingData
        query = query.filter(data => data.tag)
        const nextUpdate = await Database.Cache.General.get('updateTime')
        const moeda = await guild?.getCoin() || `${e.Coin} Safiras`
        const userRanking = query.findIndex(q => q.id === user.id) + 1 || '^2000'

        if (query.length > 10) query.length = 10

        const emojis = {
            Balance: moeda,
            Likes: '',
            Level: '',
            DailyCount: 'Dias',
            'GamingCount.Logomarca': 'Acertos',
            'GamingCount.FlagCount': 'Acertos',
            'GamingCount.QuizAnime': 'Acertos',
            'GamingCount.QuizQuestions': 'Acertos'
        }

        const format = query
            .filter(data => data.tag)
            .map((query, i) => `${query.tag ? top(i) : e.Deny} ${query.tag || '\`Not Found\`'} \`${query.id}\`\n${query.emoji} ${query[category]?.currency() || 0} ${emojis[category]}`)
            .join('\n \n')

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: embed.title,
                description: `⏱️ Próxima atualização ${Date.Timestamp(new Date(nextUpdate || Date.now() + 1000 * 60 * 15), 'R', true)}\n \n${`${format || 'O Ranking ainda não foi atualizado.'}`.limit('MessageEmbedDescription')}`,
                footer: { text: `Seu ranking: ${userRanking}` }
            }]
        })

        function top(i) {
            return {
                0: e.CoroaDourada,
                1: e.CoroaDePrata,
                2: e.thirdcrown
            }[i] || `${i + 1}.`
        }

        async function buildScriptAndSend(rankingData) {

            if (!guild.members.me.permissions.has(DiscordPermissons.AttachFiles, true))
                return await interaction.reply({
                    content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.AttachFiles}\`** para executar este recurso.`,
                    ephemeral: true
                })

            const data = rankingData?.query || []
            await interaction.reply({ content: `${e.Loading} | Construindo...`, ephemeral: true }).catch(() => { })

            const usersMapped = data.length > 0
                ? data
                    .filter(d => d.id)
                    .map((data, i) => formatText(data, i))
                    .join('\n')
                : '~~ Ninguém ~~'

            const attachment = new AttachmentBuilder(
                Buffer.from(
                    `${data.length} Contas Documentadas Acima de 0
Data de Construção: ${Date.format(new Date())}
Sua Colocação: ${data.findIndex(q => q.id == user.id) + 1 || '??'}
    
${usersMapped}
`),
                {
                    name: 'ranking.txt',
                    description: 'Raw Ranking Data'
                })
            return await interaction.editReply({ content: null, files: [attachment] }).catch(() => { })
        }

        function formatText(data, i) {
            let string = `${(i + 1) < 10 ? `0${i + 1}` : i + 1}. ${data.tag || 'User#0000'} (${data.id}) - ${data[category]?.currency() || 0}`

            if (data.id == user.id)
                string += ' 🌟'

            return string
        }
    }
}