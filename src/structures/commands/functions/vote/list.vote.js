import { Emojis as e } from '../../../../util/util.js'
import { Config } from '../../../../util/Constants.js'
import { Api } from '@top-gg/sdk'
import { SaphireClient as client } from '../../../../classes/index.js'

export default
    async interaction => {

        const { options } = interaction
        const searchUser = options.getString('search_user')
        const memberUser = options.getUser('check_member')
        const user = memberUser || client.allUsers.find(user => user.id ===  searchUser)
        const TopGG = new Api(process.env.TOP_GG_TOKEN)
        const allVotesData = await TopGG.getVotes() || []

        if (!allVotesData.length === 0)
            return await interaction.reply({
                content: `${e.Deny} | A lista de votos está vazia no momento.`,
                ephemeral: true
            })

        if (searchUser && !user)
            return await interaction.reply({
                content: `${e.Deny} | Nenhum usuário foi encontrado.`,
                ephemeral: true
            })

        if (user) {

            const vote = allVotesData.filter(votes => votes.id === user.id) || []

            if (!vote)
                return await interaction.reply({
                    content: `${e.Deny} | *${user.tag} - \`${user.id}\`* não aparece na lista de votos.`,
                    ephemeral: true
                })

            return await interaction.reply({
                content: `${e.Info} | *${user.tag} - \`${user.id}\`* votou **${vote.length}** vezes.`
            })
        }

        const mappingOnlyIds = [...new Set(allVotesData.map(vote => vote.id))]
        const uniqueArray = mappingOnlyIds
            .map(id => {
                const userData = client.allUsers.find(u => u.id === id)

                return {
                    name: userData?.tag || null,
                    id: id,
                    counter: allVotesData.filter(votes => id === votes.id)?.length || 0
                }
            })
            .filter(x => x.name)
            .sort((a, b) => b.counter - a.counter)

        const embeds = EmbedGenerator(uniqueArray)

        if (!embeds || embeds.length === 0)
            return await interaction.reply({
                content: `${e.Info} | Nenhuma lista foi formada`,
                ephemeral: true
            })

        const buttons = [{
            type: 1,
            components: [
                {
                    type: 2,
                    emoji: '⬅️',
                    custom_id: 'left',
                    style: 1
                },
                {
                    type: 2,
                    emoji: '➡️',
                    custom_id: 'right',
                    style: 1
                }
            ]
        }]

        const msg = await interaction.reply({
            embeds: [embeds[0]],
            components: embeds.length > 1 ? buttons : null,
            fetchReply: embeds.length > 1
        })

        let embedIndex = 0
        if (embeds.length <= 1) return

        return msg.createMessageComponentCollector({
            filter: int => int.user.id === interaction.user.id,
            idle: 60000
        })
            .on('collect', async ButtonInteraction => {

                const { customId } = ButtonInteraction
                ButtonInteraction.deferUpdate().catch(() => { })

                if (customId === 'right') {
                    embedIndex++
                    if (!embeds[embedIndex]) embedIndex = 0
                }

                if (customId === 'left') {
                    embedIndex--
                    if (!embeds[embedIndex]) embedIndex = embeds.length - 1
                }

                return await interaction.editReply({ embeds: [embeds[embedIndex]] }).catch(() => { })
            })
            .on('end', async () => {
                const embed = msg.embeds[0]?.data
                if (!embed) return await interaction.editReply({ components: [] }).catch(() => { })

                embed.color = client.red
                return await interaction.editReply({ components: [], embeds: [embed] }).catch(() => { })
            })

        function EmbedGenerator(array) {
            const embeds = []
            const length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1)
            let amount = 10
            let page = 1

            for (let i = 0; i < array.length; i += 10) {

                const current = array.slice(i, amount)
                const description = current
                    .map(data => `> (${data.counter}) ${data.name} - \`${data.id}\``)
                    .join('\n')
                const pageCount = length > 1 ? ` ${page}/${length}` : ''

                embeds.push({
                    color: client.blue,
                    title: `${e.topgg} ${client.user.username} Votos Recebidos${pageCount}`,
                    url: Config.TopGGLink,
                    description: description,
                    timestamp: new Date().toISOString(),
                    footer: { text: `${allVotesData.length} voto${allVotesData.length > 1 ? 's' : ''} de ${array.length} usuários` }
                })

                page++
                amount += 10

            }

            return embeds
        }
    }