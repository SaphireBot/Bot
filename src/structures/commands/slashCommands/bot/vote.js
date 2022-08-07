import { Config } from '../../../../util/Constants.js'
import { Api } from '@top-gg/sdk'

export default {
    name: 'vote',
    description: '[bot] Vote no Top.gg e ganhe uma recompensa',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'options',
            description: 'Mais opções do comando vote.',
            type: 3,
            choices: [
                {
                    name: 'Lista de votos',
                    value: 'list'
                },
                {
                    name: 'Com lembrete automático',
                    value: 'reminder'
                }
            ]
        }
    ],
    async execute({ interaction, client, Database, emojis: e }) {

        const { options, user, channel } = interaction

        const TopGG = new Api(process.env.TOP_GG_TOKEN)
        const hasVoted = await TopGG.hasVoted(user.id)

        if (hasVoted)
            return await interaction.reply({
                content: `${e.Deny} | Você já votou nas últimas 12 horas.`,
                ephemeral: true
            })

        const optionChoice = options.getString('options')
        const reminder = optionChoice === 'reminder'

        // TODO: Adicionar sub-funções options
        // if (optionChoice === 'list') return voteList()

        const cachedData = await Database.Cache.General.get(`${client.shardId}.TopGG`)

        if (cachedData?.find(data => data.userId === user.id))
            return await interaction.reply({
                content: `${e.Deny} | Você já tem uma solicitação de voto em aberto.`,
                ephemeral: true
            })

        const msg = await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.topgg} | Top.gg Bot List`,
                description: `${e.Loading} | Vote no site da Top.GG e sua recompensa aparecerá aqui.`
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'VOTAR',
                        emoji: e.Upvote,
                        url: Config.TopGGLink,
                        style: 5
                    }
                ]
            }],
            fetchReply: true
        })

        return await Database.Cache.General.push(`${client.shardId}.TopGG`, {
            userId: user.id,
            channelId: channel.id,
            messageId: msg.id,
            isReminder: reminder
        })

        // async function voteList() {

        //     const searchUserID = interaction.options.getString('search_user')
        //     const user = client.users.cache.get(searchUserID)

        //     if (searchUserID && !user)
        //         return await interaction.reply({
        //             content: `${e.Deny} | Nenhum usuário foi encontrado.`,
        //             ephemeral: true
        //         })

        //     const { Api } = require('@top-gg/sdk')
        //     const TopGG = new Api(process.env.TOP_GG_TOKEN)
        //     const allVotesData = await TopGG.getVotes() || []

        //     if (user) {
        //         const vote = allVotesData.filter(votes => votes.id === user.id) || []

        //         if (!vote || vote.length === 0)
        //             return await interaction.reply({
        //                 content: `${e.Deny} | *${user.tag} - \`${user.id}\`* não aparece na lista de votos.`,
        //                 ephemeral: true
        //             })

        //         return await interaction.reply({
        //             content: `${e.Info} | *${user.tag} - \`${user.id}\`* votou **${vote.length}** vezes.`
        //         })
        //     }

        //     const mappingOnlyIds = [...new Set(allVotesData.map(vote => vote.id))]
        //     const uniqueArray = mappingOnlyIds
        //         .map(id => ({ name: client.users.cache.get(id)?.tag || null, id: id, counter: allVotesData.filter(votes => id === votes.id)?.length || 0 }))
        //         .filter(x => x.name)
        //         // .sort((a, b) => a.name.localeCompare(b.name, 'br', { ignorePunctuation: true }))
        //         .sort((a, b) => b.counter - a.counter)

        //     if (uniqueArray.length === 0)
        //         return await interaction.reply({
        //             content: `${e.Deny} | Não há nenhum voto contabilizado.`,
        //             ephemeral: true
        //         })

        //     const embeds = EmbedGenerator(uniqueArray)

        //     const buttons = [
        //         {
        //             type: 1,
        //             components: [
        //                 {
        //                     type: 2,
        //                     emoji: '⬅️',
        //                     custom_id: 'left',
        //                     style: 'PRIMARY'
        //                 },
        //                 {
        //                     type: 2,
        //                     emoji: '➡️',
        //                     custom_id: 'right',
        //                     style: 'PRIMARY'
        //                 }
        //             ]
        //         }
        //     ]

        //     const msg = await interaction.reply({
        //         embeds: [embeds[0]],
        //         components: embeds.length > 1 ? buttons : null,
        //         fetchReply: embeds.length > 1
        //     })

        //     let embedIndex = 0
        //     if (embeds.length <= 1) return

        //     return msg.createMessageComponentCollector({
        //         filter: int => int.user.id === interaction.user.id,
        //         idle: 30000
        //     })
        //         .on('collect', async int => {

        //             const { customId } = int
        //             int.deferUpdate().catch(() => { })

        //             if (customId === 'right') {
        //                 embedIndex++
        //                 if (!embeds[embedIndex]) embedIndex = 0
        //             }

        //             if (customId === 'left') {
        //                 embedIndex--
        //                 if (!embeds[embedIndex]) embedIndex = embeds.length - 1
        //             }

        //             return await interaction.editReply({ embeds: [embeds[embedIndex]] })
        //         })
        //         .on('end', async () => {
        //             const embed = msg.embeds[0]
        //             if (!embed) return await interaction.editReply({ components: [] })

        //             embed.color = client.red
        //             return await interaction.editReply({ components: [], embeds: [embed] })
        //         })

        //     function EmbedGenerator(array) {

        //         let amount = 10
        //         let page = 1
        //         let embeds = []
        //         let length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1)

        //         for (let i = 0; i < array.length; i += 10) {

        //             let current = array.slice(i, amount)
        //             allVotesData
        //             let description = current
        //                 .map(data => {
        //                     // const counter = allVotesData.filter(votes => data.id === votes.id)?.length || 0
        //                     return `> (${data.counter}) ${data.name} - \`${data.id}\``
        //                 })
        //                 .filter(x => x).join('\n')

        //             let pageCount = length > 1 ? ` ${page}/${length}` : ''

        //             embeds.push({
        //                 color: client.blue,
        //                 title: `${e.topgg} ${client.user.username} Votos Recebidos${pageCount}`,
        //                 url: Config.TopGGLink,
        //                 description: description,
        //                 timestamp: new Date(),
        //                 footer: { text: `${array.length} Membros contabilizados | ${allVotesData.length} Votos contabilizados` }
        //             })

        //             page++
        //             amount += 10

        //         }

        //         return embeds
        //     }
        // }

    }
}