import { Permissions } from '../../../../util/Constants.js'
import createGiveaway from '../../functions/giveaway/create.giveaway.js'
import deleteGiveaway from '../../functions/giveaway/delete.giveaway.js'

export default {
    name: 'giveaway',
    description: '[moderation] Crie sorteios no servidor',
    type: 1,
    default_member_permissions: Permissions.ManageEvents,
    dm_permission: false,
    options: [
        {
            name: 'create',
            description: '[moderation] Crie um novo sorteio',
            type: 1,
            options: [
                {
                    name: 'prize',
                    description: 'Prêmio do sorteio',
                    min_length: 2,
                    max_length: 100,
                    type: 3,
                    required: true
                },
                {
                    name: 'time',
                    description: 'Para quando é o sorteio?',
                    max_length: 100,
                    type: 3,
                    required: true
                },
                {
                    name: 'channel',
                    description: 'Canal do sorteio',
                    type: 7,
                    required: true,
                    channel_types: [0, 5]
                },
                {
                    name: 'winners',
                    description: 'Quantidade de vencedores',
                    type: 4,
                    max_value: 20,
                    min_value: 1
                },
                {
                    name: 'requires',
                    description: 'Quais os requisitos para este sorteio',
                    max_length: 1024,
                    type: 3
                },
                {
                    name: 'imageurl',
                    description: 'Quer alguma imagem no sorteio?',
                    type: 3
                },
                {
                    name: 'color',
                    description: 'Selecione a cor da embed',
                    type: 3,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'list',
            description: '[moderation] Lista de todos os sorteios',
            type: 1
        },
        {
            name: 'reroll',
            description: '[moderation] Resorteie um sorteio',
            type: 1,
            options: [
                {
                    name: 'id',
                    description: 'ID do sorteio (Id da mensagem do sorteio)',
                    type: 3,
                    required: true
                },
                {
                    name: 'winners',
                    description: 'Quantidade de vendores',
                    type: 4,
                    min_value: 1,
                    max_value: 20,
                    required: true
                }
            ]
        },
        {
            name: 'options',
            description: '[moderation] Opções e funções adicionais',
            type: 1,
            options: [
                {
                    name: 'method',
                    description: 'Escolha o método a ser utilizado',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'delete',
                            value: 'delete'
                        },
                        {
                            name: 'reset',
                            value: 'reset'
                        },
                        {
                            name: 'finish',
                            value: 'finish'
                        },
                        {
                            name: 'info',
                            value: 'info'
                        }
                    ],
                },
                {
                    name: 'select_giveaway',
                    description: 'Selecione o sorteio relacionado',
                    type: 3,
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    async execute({ interaction, Database, emojis: e }) {

        const { options, guild, user } = interaction

        for (let perm of [{ discord: 'ManageChannels', user: 'GERENCIAR CANAIS' }, { discord: 'ManageMessages', user: 'GERENCIAR MENSAGENS' }])
            if (!guild.clientHasPermission(perm.discord))
                return await interaction.reply({
                    content: `❌ | Eu preciso da permissão **\`${perm.user}\`**. Por favor, me dê esta permissão que eu vou conseguir fazer o sorteio.`,
                    ephemeral: true
                })

        const subCommand = options.getSubcommand()
        // let giveawayId = options.getString('id')
        // let WinnersAmount = options.getInteger('winners') || 1
        // let TimeMs = 0

        switch (subCommand) {
            case 'create': createGiveaway(interaction); break;
            // case 'list': listGiveaway(); break;
            // case 'reroll': rerollGiveaway(); break;
            case 'options': methodsGiveaway(); break;
        }

        return

        async function methodsGiveaway() {

            switch (options.getString('method')) {
                case 'delete': deleteGiveaway(interaction); break;
                case 'reset': resetGiveaway(); break;
                case 'finish': finishGiveaway(); break;
                case 'info': infoGiveaway(); break;
            }
            return

            async function resetGiveaway() {

                let sorteio = await Database.Giveaway.findOne({ MessageID: giveawayId })

                if (!sorteio)
                    return await interaction.reply({
                        content: `${e.Deny} | Sorteio não encontrado. Verifique se o ID está correto.`,
                        ephemeral: true
                    })


                let Emojis = ['✅', '❌'],
                    msg = await await interaction.reply({
                        content: `${e.QuestionMark} | Deseja resetar o tempo do sorteio \`${giveawayId}\`?`,
                        fetchReply: true
                    })

                for (const emoji of Emojis)
                    msg.react(emoji).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (r, u) => Emojis.includes(r.emoji.name) && u.id === user.id,
                    time: 30000
                })

                    .on('collect', async (reaction) => {

                        if (reaction.emoji.name === Emojis[1]) // X
                            return collector.stop()

                        const Time = sorteio.TimeMs

                        await Database.Giveaway.updateOne(
                            { MessageID: giveawayId },
                            {
                                DateNow: Date.now(),
                                TimeEnding: Data(Time),
                                Actived: true
                            }
                        )

                        msg.reactions.removeAll().catch(() => { })

                        let channel = await guild.channels.cache.get(sorteio.ChannelId)
                        let message = await channel.messages.fetch(giveawayId)
                        let embed = message.embeds[0]

                        if (!embed) return await interaction.reply({
                            content: `${e.Deny} | Embed do sorteio não encontrada.`,
                            ephemeral: true
                        })

                        embed.color = 0x0099ff
                        embed.title = `${e.Tada} Sorteios ${guild.name}`
                        embed.description = `Para entrar no sorteio, basta reagir no emoji ${sorteio.Emoji}`
                        embed.timestamp = new Date(Date.now() + TimeMs)
                        embed.footer = { text: `Giveaway ID: ${sorteio?.MessageID} | Resultado` }
                        message.edit({ embeds: [embed] }).catch(() => { })

                        return msg.edit(`${e.Check} | Sorteio resetado com sucesso. *Não é necessário os membros entrarem novamente*`).catch(() => { })

                    })

                    .on('end', collected => {
                        if (collected.size > 0) return
                        return msg.edit(`${e.Deny} | Comando cancelado.`)
                    })

            }

            async function finishGiveaway() {

                let sorteio = await Database.Giveaway.findOne({ MessageID: giveawayId }, 'Actived')

                if (!sorteio)
                    return await interaction.reply({
                        content: `${e.Deny} | Sorteio não encontrado. Verifique se o ID está correto.`,
                        ephemeral: true
                    })

                if (!sorteio?.Actived)
                    return await interaction.reply({
                        content: `${e.Deny} | Este sorteio já foi está finalizado.`,
                        ephemeral: true
                    })

                await Database.Giveaway.updateOne(
                    { MessageID: giveawayId },
                    { DateNow: 0 }
                )

                return await interaction.reply({
                    content: `${e.Check} | Sorteio \`${giveawayId}\` finalizado com sucesso!`,
                    ephemeral: true
                })

            }

            async function infoGiveaway() {

                let sorteio = await Database.Giveaway.findOne({ MessageID: giveawayId })

                if (!sorteio)
                    return await interaction.reply({
                        content: `${e.Deny} | Sorteio não encontrado. Verifique se o ID está correto.`,
                        ephemeral: true
                    })

                let WinnersAmount = sorteio?.Winners,
                    Participantes = sorteio?.Participants || [],
                    Sponsor = sorteio?.Sponsor,
                    Prize = sorteio?.Prize,
                    MessageLink = sorteio?.MessageLink,
                    Actived = sorteio?.Actived,
                    Emoji = formatEmoji(sorteio?.Emoji || null),
                    Vencedores = sorteio?.WinnersGiveaway || [],
                    VencedoresMapped = Vencedores?.map(winner => {

                        let member = guild.members.cache.get(winner)

                        return member
                            ? `> ${member.user.tag.replace(/`/g, '')} - \`${member.id}\``
                            : '> Membro não encontrado'

                    }).join('\n') || '> Ninguém',
                    description = `> :id: \`${giveawayId}\`\n> 👐 Patrocinador*(a)*: ${guild.members.cache.get(Sponsor)?.user.tag || 'Não encontrado'}\n> ${e.Star} Prêmio: ${Prize}\n> 👥 Participantes: ${Participantes?.length || 0}\n> ${e.CoroaDourada} Vencedores: ${WinnersAmount}\n> ${e.Info} Emoji: ${Emoji}\n> ⏱️ Término: \`${sorteio?.TimeEnding || 'Indefinido'}\`\n> ${Actived ? `${e.Check} Ativado` : `${e.Deny} Desativado`}\n> 🔗 [Sorteio Link](${MessageLink})`,
                    Emojis = ['⬅️', '➡️', '❌'],
                    Control = 0,
                    Embeds = EmbedGenerator() || [{
                        color: client.blue,
                        title: `${e.Tada} Informações do sorteio`,
                        description: `${description}`,
                        fields: [
                            {
                                name: '👥 Participantes',
                                value: '> Contagem válida após sorteio'
                            },
                            {
                                name: `${e.OwnerCrow} Vencedores do Sorteios`,
                                value: '> Contagem válida após sorteio'
                            }
                        ],
                        footer: {
                            text: `${Participantes.length} participantes contabilizados`
                        },
                    }],
                    msg = await await interaction.reply({ embeds: [Embeds[0]] })

                if (Embeds.length === 1)
                    return

                for (const emoji of Emojis)
                    msg.react(emoji).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (r, u) => Emojis.includes(r.emoji.name) && u.id === user.id,
                    idle: 30000
                })

                    .on('collect', (reaction) => {

                        if (reaction.emoji.name === Emojis[2])
                            return collector.stop()

                        return reaction.emoji.name === Emojis[0]
                            ? (() => {

                                Control--
                                return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++

                            })()
                            : (() => {

                                Control++
                                return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--

                            })()

                    })

                    .on('end', collected => {
                        if (collected.size > 0) return
                        return msg.edit({ content: `${e.Deny} | Comando desativado` }).catch(() => { })

                    })

                function EmbedGenerator() {

                    let amount = 10,
                        Page = 1,
                        embeds = [],
                        length = Participantes.length / 10 <= 1 ? 1 : parseInt((Participantes.length / 10) + 1)

                    for (let i = 0; i < Participantes.length; i += 10) {

                        let current = Participantes.slice(i, amount),
                            GiveawayMembersMapped = current.map(Participante => {

                                let Member = guild.members.cache.get(Participante)

                                return Member ? `> ${Member.user.tag.replace(/`/g, '')} - \`${Member.id}\`` : (async () => {

                                    await Database.Giveaway.updateOne(
                                        { MessageID: giveawayId },
                                        { $pull: { Participants: Participante } }
                                    )

                                    return `> ${e.Deny} Usuário deletado`
                                })()

                            }).join("\n")

                        if (current.length > 0) {

                            embeds.push({
                                color: client.blue,
                                title: `${e.Tada} Informações do sorteio`,
                                description: `${description}`,
                                fields: [
                                    {
                                        name: `👥 Participantes ${length > 0 ? `- ${Page}/${length}` : ''}`,
                                        value: `${GiveawayMembersMapped || '> Nenhum membro entrou neste sorteio'}`
                                    },
                                    {
                                        name: `${e.OwnerCrow} Vencedores do Sorteios${Vencedores.length > 0 ? `: ${Vencedores.length}/${WinnersAmount}` : ''}`,
                                        value: `${VencedoresMapped}`
                                    }
                                ],
                                footer: {
                                    text: `${Participantes.length} participantes contabilizados`
                                },
                            })

                            Page++
                            amount += 10

                        }

                    }

                    return embeds.length === 0 ? null : embeds
                }


            }

            function formatEmoji(data) {

                if (!data) return '🎉'
                let isId = parseInt(data)
                return isId
                    ? guild.emojis.cache.get(data) || '🎉'
                    : data
            }

        }

        async function rerollGiveaway() {

            let sorteio = await Database.Giveaway.findOne({ MessageID: giveawayId })

            if (!sorteio)
                return await interaction.reply({
                    content: `${e.Deny} | Sorteio não encontrado. Verifique se o ID fornecido está correto.`,
                    ephemeral: true
                })

            if (sorteio?.Actived)
                return await interaction.reply({
                    content: `${e.Deny} | Este sorteio ainda está ativado e não é possível o reroll antes do término. Caso você queira finalizar este sorteio antes da hora, use o comando \`/giveaway options[finish] ${giveawayId}\``,
                    ephemeral: true
                })

            return NewReroll(sorteio, giveawayId, WinnersAmount)
        }

        async function NewReroll(sorteio, MessageId, WinnersAmount) {

            let Participantes = sorteio?.Participants || [],
                Channel = guild.channels.cache.get(sorteio?.ChannelId),
                Sponsor = sorteio?.Sponsor,
                Prize = sorteio?.Prize || 'Indefinido',
                MessageLink = sorteio?.MessageLink

            if (!Channel)
                return await interaction.reply({
                    content: `${e.Deny} | Canal não encontrado.`,
                    ephemeral: true
                })

            if (!Participantes || Participantes.length === 0) {
                Database.deleteGiveaway(MessageId)
                return await interaction.reply({
                    content: `${e.Deny} | Reroll cancelado por falta de participantes.\n🔗 | Sorteio link: ${sorteio?.MessageLink}`,
                    ephemeral: true
                })
            }

            let vencedores = GetWinners(Participantes, WinnersAmount)

            if (vencedores.length === 0) {
                Database.deleteGiveaway(MessageId)
                return await interaction.reply({
                    content: `${e.Deny} | Reroll cancelado por falta de participantes.\n🔗 | Sorteio link: ${sorteio?.MessageLink}`,
                    ephemeral: true
                })
            }

            let vencedoresMapped = vencedores.map(memberId => `${GetMember(memberId)}`).join('\n')

            Channel.send({
                embeds: [
                    {
                        color: client.green,
                        title: `${e.Tada} Sorteio Finalizado [Reroll]`,
                        url: MessageLink,
                        fields: [
                            {
                                name: `${e.CoroaDourada} Vencedores`,
                                value: `${vencedoresMapped || 'Ninguém'}`,
                                inline: true
                            },
                            {
                                name: `${e.ModShield} Patrocinador`,
                                value: `${guild.members.cache.get(Sponsor) || `${e.Deny} Patrocinador não encontrado`}`,
                                inline: true
                            },
                            {
                                name: `${e.Star} Prêmio`,
                                value: `${Prize}`,
                                inline: true
                            },
                            {
                                name: `🔗 Giveaway Reference`,
                                value: `[Link do Sorteio](${MessageLink})`
                            }
                        ]
                    }
                ]

            }).catch(() => Database.deleteGiveaway(MessageId))

            await Database.Giveaway.updateOne(
                { MessageID: MessageId },
                { TimeToDelete: Date.now() }
            )

            return await interaction.reply({
                content: `${e.Check} | Rerrol realizado com sucesso!`,
                ephemeral: true
            })
            function GetWinners(WinnersArray, Amount) {

                let Winners = []

                if (WinnersArray.length === 0)
                    return []

                WinnersArray.length >= Amount
                    ? (() => {

                        for (let i = 0; i < Amount; i++)
                            Winners.push(GetUserWinner())

                    })()
                    : (() => Winners.push(...WinnersArray))()

                function GetUserWinner() {

                    const Winner = WinnersArray[Math.floor(Math.random() * WinnersArray.length)]
                    return Winners.includes(Winner) ? GetUserWinner() : Winner

                }

                return Winners
            }

            function GetMember(memberId) {
                const member = guild.members.cache.get(memberId)

                return member
                    ? `${member} *\`${member?.id || '0'}\`*`
                    : (async () => {

                        await Database.Giveaway.updateOne(
                            { MessageID: MessageId },
                            { $pull: { Participants: memberId } }
                        )

                        return `${e.Deny} Usuário não encontrado.`
                    })()
            }
        }

        async function listGiveaway() {

            let Sorteios = await Database.Giveaway.find({ GuildId: guild.id })

            if (!Sorteios || Sorteios.length === 0)
                return await interaction.reply({
                    content: `${e.Deny} | Este servidor não tem nenhum sorteio na lista.`,
                    ephemeral: true
                })

            let Embeds = EmbedGenerator(),
                Control = 0,
                Emojis = ['◀️', '▶️', '❌'],
                msg = await interaction.reply({ embeds: [Embeds[0]], fetchReply: true }),
                react = false

            if (Embeds.length > 1)
                for (const emoji of Emojis)
                    msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (r, u) => Emojis.includes(r.emoji.name) && u.id === user.id,
                idle: 30000
            })
                .on('collect', (reaction) => {

                    if (reaction.emoji.name === Emojis[2]) // X
                        return collector.stop()
                    react = true
                    return reaction.emoji.name === Emojis[0] // Left
                        ? (() => {
                            Control--
                            return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++
                        })()
                        : (() => { // Right
                            Control++
                            return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--
                        })()
                })
                .on('end', () => {
                    if (react) return
                    let embed = msg.embeds[0]
                    if (!embed) return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })

                    embed.color = client.red
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [embed] }).catch(() => { })
                })

            function EmbedGenerator() {

                let amount = 5,
                    Page = 1,
                    embeds = [],
                    length = Sorteios.length / 5 <= 1 ? 1 : parseInt((Sorteios.length / 5) + 1)

                for (let i = 0; i < Sorteios.length; i += 5) {

                    let current = Sorteios.slice(i, amount),
                        description = current.map(Gw => `> 🆔 \`${Gw.MessageID}\`\n> ⏱️ Término: \`${Gw.TimeEnding}\`\n> ${Gw?.Actived ? `${e.Check} Ativado` : `${e.Deny} Desativado`}\n> ${e.Info} \`/giveaway options method:info id:${Gw.MessageID}\`\n--------------------`).join("\n") || false

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            title: `${e.Tada} Sorteios ${guild.name} ${length > 1 ? `- ${Page}/${length}` : ''}`,
                            description: `${description || 'Nenhum sorteio encontrado'}`,
                            footer: {
                                text: `${Sorteios.length} sorteios contabilizados`
                            },
                        })

                        Page++
                        amount += 5
                    }
                }
                return embeds;
            }
            return

        }

    }
}