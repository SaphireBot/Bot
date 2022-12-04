import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'

export default {
    name: 'lastclick',
    description: '[games] Quem clicar na bomba, perde.',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'oponente',
            description: 'Quem será seu oponente nesta partida?',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'bet',
            description: 'Aposte uma quantia com seu oponente',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1
        }
    ],
    helpData: {
        description: 'Quem clicar errado, perde'
    },
    async execute({ interaction, e, Database, guildData, client }) {

        const { user, options, channel, guild } = interaction
        const inChannelGame = await Database.Cache.General.get(`${client.shardId}.lastClick`) || []

        if (inChannelGame.includes(channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Já tem um last click rolando neste canal, espere ele terminar.`,
                ephemeral: true
            })

        const opponent = options.getUser('oponente')

        if (!await guild.members.fetch(opponent?.id || 'undefined').catch(() => null))
            return await interaction.reply({
                content: `${e.Deny} | O oponente selecionado não percente a este servidor.`,
                ephemeral: true
            })

        const amount = options.getInteger('bet')
        const isBet = amount
        const moeda = guildData?.Moeda || `${e.Coin} Safiras`
        let control = {
            playNow: [opponent.id, user.id].random(),
            buttons: getButtons(),
            customIds: [],
            clicks: 0,
            userEmoji: '🔴',
            opponentEmoji: '⚪',
            userMoney: 0,
            opponentMoney: 0
        }

        if (opponent.id === user.id)
            return await interaction.reply({
                content: `${e.Deny} | Você não pode jogar contra você mesmo.`,
                ephemeral: true
            })

        if (opponent.bot)
            return await interaction.reply({
                content: `${e.Deny} | Eu manipularia o jogo pros bot vencerem. Não acha?`,
                ephemeral: true
            })

        Database.Cache.General.push(`${client.shardId}.lastClick`, channel.id)

        if (isBet) {

            const data = await Database.getUsers([user.id, opponent.id], 'id Balance')
            const userData = data.find(d => d.id === user.id)
            const opponentData = data.find(d => d.id === opponent.id)

            if (!userData) {
                Database.Cache.General.pull(`${client.shardId}.lastClick`, channel.id)

                Database.registerUser(user)
                return await interaction.reply({
                    content: `${e.Deny} | Tente novamente. Efetuei seu cadastro no banco de dados.`,
                    ephemeral: true
                })
            }

            if (!opponentData) {
                Database.Cache.General.pull(`${client.shardId}.lastClick`, channel.id)

                Database.registerUser(opponent)
                return await interaction.reply({
                    content: `${e.Deny} | Tente novamente. Efetuei o cadastro de ${opponent} no banco de dados.`,
                    ephemeral: true
                })
            }

            let userMoney = userData.Balance || 0
            let opponentMoney = opponentData.Balance || 0

            if (!opponentMoney || opponentMoney < amount) {
                Database.Cache.General.pull(`${client.shardId}.lastClick`, channel.id)

                return await interaction.reply({
                    content: `${e.Deny} | ${opponent} não tem todo esse dinheiro.`,
                    ephemeral: true
                })
            }

            if (!userMoney || userMoney < amount) {
                Database.Cache.General.pull(`${client.shardId}.lastClick`, channel.id)

                return await interaction.reply({
                    content: `${e.Deny} | Você não tem todo esse dinheiro.`,
                    ephemeral: true
                })
            }

        }

        let betMessage = isBet ? `\n${e.Info} | ${user} está querendo apostar ${amount} ${moeda}.` : ''
        let msg = await interaction.reply({
            content: `${e.QuestionMark} | ${opponent}, você está sendo desafiado por ${user} para uma partida de *Last Click*.${betMessage}`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'ACEITAR',
                            custom_id: 'accept',
                            style: ButtonStyle.Success
                        },
                        {
                            type: 2,
                            label: 'RECUSAR',
                            custom_id: 'refuse',
                            style: ButtonStyle.Danger
                        }
                    ]
                }
            ],
            fetchReply: true
        })

        const collector = msg.createMessageComponentCollector({
            filter: int => [opponent.id, user.id].includes(int.user.id),
            time: 60000,
            max: 1
        })
            .on('collect', int => {

                const { customId } = int

                if (customId === 'refuse') {
                    collector.stop()
                    Database.Cache.General.pull(`${client.shardId}.lastClick`, channel.id)
                    return msg.edit({
                        content: `${e.Deny} | Desafio recusado`,
                        components: []
                    }).catch(() => { })
                }

                int.deferUpdate().catch(() => { })
                if (user.id === int.user.id) return

                if (isBet) {
                    Database.subtract(user.id, amount)
                    Database.subtract(opponent.id, amount)
                }

                return initGame()
            })
            .on('end', (i, reason) => {
                if (['user', 'limit'].includes(reason)) return
                Database.Cache.General.pull(`${client.shardId}.lastClick`, channel.id)
                return msg.edit({
                    content: `${e.Deny} | Desafio cancelado`,
                    components: []
                }).catch(() => { })
            })

        async function initGame() {

            msg.edit({
                content: `<@${control.playNow}>, é sua vez.`,
                components: control.buttons
            })

            let collector = msg.createMessageComponentCollector({
                filter: int => [user.id, opponent.id].includes(int.user.id),
                idle: 60000
            })
                .on('collect', async int => {

                    const { customId, user: author } = int

                    int.deferUpdate().catch(() => { })
                    if (author.id !== control.playNow) return

                    let buttonIndex = { a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, b1: 1, b2: 1, b3: 1, b4: 1, b5: 1, c1: 2, c2: 2, c3: 2, c4: 2, c5: 2, d1: 3, d2: 3, d3: 3, d4: 3, d5: 3 }[`${customId}`]

                    if (control.customIds.includes(customId)) return

                    control.customIds.push(customId)

                    let buttom = control.buttons[buttonIndex].components.find(data => data.custom_id === customId)

                    let isBomb = Math.floor(Math.random() * 100) < 10

                    control.clicks++
                    buttom.emoji = isBomb ? '💥' : control.playNow === user.id ? control.userEmoji : control.opponentEmoji
                    buttom.disabled = true
                    buttom.style = isBomb ? ButtonStyle.Danger : ButtonStyle.Primary
                    control.playNow = control.playNow === user.id ? opponent.id : user.id

                    if (isBomb) {
                        collector.stop()
                        await disableAllButtons(control)
                        let loserId = control.playNow === user.id ? opponent.id : user.id
                        let isBetMessage = ''

                        if (isBet) {
                            Database.add(control.playNow, amount * 2)
                            isBetMessage = `\n${e.Info} | <@${control.playNow}> ganhou um total de ${amount * 2} ${moeda}`
                        }

                        return msg.edit({
                            content: `👑 | <@${loserId}> clicou na bomba e <@${control.playNow}> venceu a partida.${isBetMessage}`,
                            components: control.buttons
                        })
                    }

                    if (control.clicks >= 20) {
                        collector.stop()
                        if (isBet) {
                            Database.add(user.id, amount)
                            Database.add(opponent.id, amount)
                        }
                        return msg.edit({ content: '👑 Ambos venceram.', components: control.buttons })
                    }

                    return msg.edit({ content: `<@${control.playNow}>, é sua vez.`, components: control.buttons })
                })
                .on('end', (i, reason) => {
                    Database.Cache.General.pull(`${client.shardId}.lastClick`, channel.id)
                    if (reason === 'user') return

                    if (isBet) {
                        Database.add(user.id, amount)
                        Database.add(opponent.id, amount)
                    }

                    return msg.edit({
                        content: `${e.Deny} | Game cancelado por falta de resposta`,
                        components: []
                    }).catch(() => { })
                })
        }

        function disableAllButtons(control) {

            let allButtons = [
                control.buttons[0].components[0],
                control.buttons[0].components[1],
                control.buttons[0].components[2],
                control.buttons[0].components[3],
                control.buttons[0].components[4],
                control.buttons[1].components[0],
                control.buttons[1].components[1],
                control.buttons[1].components[2],
                control.buttons[1].components[3],
                control.buttons[1].components[4],
                control.buttons[2].components[0],
                control.buttons[2].components[1],
                control.buttons[2].components[2],
                control.buttons[2].components[3],
                control.buttons[2].components[4],
                control.buttons[3].components[0],
                control.buttons[3].components[1],
                control.buttons[3].components[2],
                control.buttons[3].components[3],
                control.buttons[3].components[4]
            ]

            for (let button of allButtons)
                if (!button.disabled)
                    button.disabled = true
                else continue
            return
        }

        function getButtons() {

            let emojiDefault = e.Hmmm

            /*
                a1 a2 a3 a4 a5
                b1 b2 b3 b4 b5
                c1 c2 c3 c4 c5
                d1 d2 d3 d4 d5
            */

            return [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a1',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a2',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a3',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a4',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a5',
                            style: ButtonStyle.Secondary
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b1',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b2',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b3',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b4',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b5',
                            style: ButtonStyle.Secondary
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c1',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c2',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c3',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c4',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c5',
                            style: ButtonStyle.Secondary
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd1',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd2',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd3',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd4',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'd5',
                            style: ButtonStyle.Secondary
                        }
                    ]
                }
            ]
        }
    }
}