import { ButtonStyle } from "discord.js"

export default {
    name: 'transactions',
    description: '[economy] Confira suas transações',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Selecione um usuário para ver suas transações',
            type: 6
        }
    ],
    helpData: {
        description: 'Com este comando você consegue ver toda a sua movimentação econômica'
    },
    async execute({ interaction, client, Database, emojis: e, modals }) {

        const { options, user: author } = interaction
        const user = options.getUser('user')
            || await client.users.fetch(options.getString('database_users')).catch(() => null)
            || author

        if (!user || user.bot)
            return await interaction.reply({
                content: `${e.Deny} | Usuário não encontrado.`,
                ephemeral: true
            })

        const userData = await Database.User.findOne({ id: user?.id }, 'Transactions')

        if (!userData)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | Não foi possível obter os dados de **${user?.tag || 'indefinido'}** *\`${user?.id || 0}\`*`,
                ephemeral: true
            }).catch(() => { })

        const transactions = userData?.Transactions || []
        let EmbedsControl = 0

        if (transactions.length === 0)
            return await interaction.reply({
                content: `${e.Deny} | Nenhuma transação foi encontrada.`,
                ephemeral: true
            })

        let embeds = EmbedGenerator(userData?.Transactions) || []

        if (!embeds || !embeds.length)
            return await interaction.reply({
                content: `${e.Deny} | Embed Generation Failed to Payload.`,
                ephemeral: true
            })

        if (embeds.length === 1)
            return await interaction.reply({ embeds: [embeds[0]] })

        const buttons = {
            type: 1,
            components: [
                {
                    type: 2,
                    emoji: '⏪',
                    custom_id: 'zero',
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    emoji: '◀️',
                    custom_id: 'left',
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    emoji: '▶️',
                    custom_id: 'right',
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    emoji: '⏩',
                    custom_id: 'last',
                    style: ButtonStyle.Primary
                },
            ]
        }

        const selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'menu',
                placeholder: 'Opções de transações',
                options: [
                    {
                        label: 'Ganho',
                        emoji: e.gain || '💸',
                        description: 'Filtre suas transações por ganho de Safiras',
                        value: 'gain',
                    },
                    {
                        label: 'Perda',
                        emoji: e.loss || '📈',
                        description: 'Filtre suas transações por perda de Safiras',
                        value: 'lose',
                    },
                    {
                        label: 'Administrativo',
                        emoji: e.Admin || '⚙️',
                        description: 'Filtre suas transações por ações administrativas',
                        value: 'admin',
                    },
                    {
                        label: 'Início',
                        emoji: '🔄',
                        description: 'Volte para a página inicial de transações',
                        value: 'all',
                    },
                    {
                        label: 'Reportar',
                        emoji: '🚨',
                        description: 'Reporte um erro nas suas transações',
                        value: 'reportTransactions',
                    },
                    {
                        label: 'Cancelar',
                        emoji: '❌',
                        description: 'Encerre o comando',
                        value: 'cancel',
                    },
                ]
            }]
        }

        const dataComponents = {
            content: 'Use os botões abaixo para navegar entre as transações',
            embeds: [embeds[0]],
            fetchReply: true
        }

        if (embeds.length > 1)
            dataComponents.components = [selectMenuObject, buttons]

        const msg = await interaction.reply(dataComponents)

        if (embeds.length <= 1) return

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === author.id,
            idle: 40000
        })
            .on('collect', async (int) => {

                let customId = int.customId === 'menu' ? int.values[0] : int.customId

                if (customId === 'reportTransactions') return await int.showModal(modals.transactionsReport)

                if (customId === 'cancel') return collector.stop()

                if (customId === 'zero') {
                    if (EmbedsControl === 0) return await int.deferUpdate()
                    EmbedsControl = 0
                    return await int.update({ embeds: [embeds[0]] }).catch(() => { })
                }

                if (customId === 'last') {
                    EmbedsControl = EmbedsControl === embeds.length - 1 ? 0 : embeds.length - 1
                    return await int.update({ embeds: [embeds[EmbedsControl]] }).catch(() => { })
                }

                if (customId === 'right') {
                    if (EmbedsControl === embeds.length - 1) EmbedsControl = 0
                    else EmbedsControl++
                    return await int.update({ embeds: [embeds[EmbedsControl]] }).catch(() => { })
                }

                if (customId === 'left') {
                    if (EmbedsControl <= 0) EmbedsControl = embeds.length - 1
                    else EmbedsControl--
                    return await int.update({ embeds: [embeds[EmbedsControl]] }).catch(() => { })
                }

                if (customId === 'gain') {
                    embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.gain)))

                    if (!embeds || embeds.length === 0)
                        return await int.update({
                            content: 'Nenhuma transação da categora "Lucro" foi encontrada.', embeds: [{
                                color: client.red,
                                title: 'Página de transações',
                                description: `${e.saphireDesespero} Tem nada aqui`
                            }]
                        }).catch(() => { })

                    if (embeds.length === 1)
                        return await int.update({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                    EmbedsControl = 0
                    return await int.update({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [selectMenuObject, buttons] }).catch(() => { })
                }

                if (customId === 'lose') {
                    embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.loss)))

                    if (!embeds || embeds.length === 0)
                        return await int.update({
                            content: 'Nenhuma transação da categora "Perda" foi encontrada.', embeds: [{
                                color: client.red,
                                title: 'Página de transações',
                                description: `${e.saphireDesespero} Tem nada aqui`
                            }]
                        }).catch(() => { })

                    if (embeds.length === 1)
                        return await int.update({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                    EmbedsControl = 0
                    return await int.update({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [selectMenuObject, buttons] }).catch(() => { })
                }

                if (customId === 'admin') {
                    embeds = EmbedGenerator(userData?.Transactions?.filter(data => data.data?.includes(e.Admin)))

                    if (!embeds || embeds.length === 0)
                        return await int.update({
                            content: 'Nenhuma transação da categora "Ações de Administradores" foi encontrada.', embeds: [{
                                color: client.red,
                                title: 'Página de transações',
                                description: `${e.saphireDesespero} Tem nada aqui`
                            }]
                        }).catch(() => { })

                    if (embeds.length === 1)
                        return await int.update({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                    EmbedsControl = 0
                    return await int.update({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [selectMenuObject, buttons] }).catch(() => { })
                }

                if (customId === 'all') {
                    embeds = EmbedGenerator(userData?.Transactions)

                    if (!embeds || embeds.length === 0)
                        return await int.update({
                            content: 'Nenhuma transação da categora "Total" foi encontrada.', embeds: [{
                                color: client.red,
                                title: 'Página de transações',
                                description: `${e.saphireDesespero} Tem nada aqui`
                            }]
                        }).catch(() => { })

                    if (embeds.length === 1)
                        return await int.update({ content: 'Apenas uma página de transações.', embeds: [embeds[0]], components: [selectMenuObject] }).catch(() => { })

                    EmbedsControl = 0
                    return await int.update({ content: 'Use os botões para navegar entre as transações.', embeds: [embeds[0]], components: [selectMenuObject, buttons] }).catch(() => { })
                }

                return
            })
            .on('end', () => {

                const embed = msg.embeds[0]?.data
                if (!embed) return msg.edit({ components: [] }).catch(() => { })

                embed.color = client.red
                return msg.edit({ embeds: [embed], components: [] }).catch(() => { })
            })

        function EmbedGenerator(transactions = []) {

            let amount = 10
            let Page = 1
            const embeds = []
            const AuthorOrUser = user.id === author.id ? 'Suas transações' : `Transações de ${user.tag}`
            const length = transactions.length / 10 <= 1 ? 1 : parseInt((transactions.length / 10) + 1)

            for (let i = 0; i < transactions.length; i += 10) {

                const current = transactions.slice(i, amount)
                const description = current.map(t => `> \`${t.time}\` ${t.data}`).join("\n")

                if (current.length > 0) {

                    embeds.push({
                        color: client.blue,
                        title: `${e.MoneyWings} ${AuthorOrUser} - ${Page}/${length}`,
                        description: `${description}`,
                        footer: {
                            text: `${transactions.length} transações contabilizadas`
                        },
                    })

                    Page++
                    amount += 10
                }

            }

            return embeds
        }
    }
}