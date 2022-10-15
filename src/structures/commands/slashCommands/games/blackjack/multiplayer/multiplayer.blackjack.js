import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"
import {
    SaphireClient as client,
    Database
} from "../../../../../../classes/index.js"

export default async ({ interaction, BlackJackEmojis }) => {

    const { options, user, guild } = interaction
    const betValue = options.getInteger('bet') || 0
    const packsAmount = options.getInteger('packs') || 2
    const players = [user.id]
    const packs = []
    const emojis = [...BlackJackEmojis]
    let authorMoney = 0

    if (betValue > 0) {
        const userMoney = await user.balance()

        if (!userMoney || userMoney < betValue)
            return await interaction.reply({
                content: `${e.Deny} | Você ainda precisa de **${betValue - userMoney} ${await guild.getCoin()}** para iniciar uma aposta nesse valor.`,
                ephemeral: true
            })

        authorMoney += parseInt(userMoney)
        Database.subtract(user.id, betValue, `${e.loss} Gastou ${betValue} Safiras iniciando um *Blackjack Multiplayer*`)
    }

    for (let i = 0; i < packsAmount; i++)
        packs.push(emojis)

    for (let i = 2; i <= 7; i++) {
        const player = options.getUser(`player${i}`)
        if (!player) continue
        if (players.includes(player.id) || player.bot) continue
        players.push(player.id)
    }

    if (players.length === 1)
        return await interaction.reply({
            content: `${e.Deny} | Apenas 1 jogador válido foi selecionado.\n${e.saphireRight} | Sabe que bots não pode jogar, né? Eu vou roubar pra eles, poxa. E não tenta colocar jogadores repetidos, uma vez é o suficiente, ok?`
        })

    const msg = await interaction.reply({
        embeds: [{
            color: client.blue,
            title: `${client.user.username}'s Multiplayer Blackjack`,
            description: players.map(id => `${id === user.id ? e.Check : e.Loading} <@${id}>`).join('\n'),
            fields: [
                {
                    name: '📌 Status',
                    value: 'Esperando confirmação dos jogadores'
                },
                {
                    name: `${e.Info} Informações do jogo`,
                    value: `${e.baralho} ${packsAmount} Baralhos\n👥 ${players.length} Jogadores convidados${betValue > 0 ? `\n${e.MoneyWings} ${betValue} ${await guild.getCoin()} apostados` : ''}`
                },
                {
                    name: '⏱ Tempo',
                    value: Date.Timestamp(60000, 'R')
                }
            ]
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Bora',
                    emoji: e.Stonks,
                    custom_id: JSON.stringify({ c: 'bjm', src: 'accept' }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Quero não',
                    emoji: e.saphireRight,
                    custom_id: JSON.stringify({ c: 'bjm', src: 'deny' }),
                    style: ButtonStyle.Danger
                },
            ]
        }],
        fetchReply: true
    })

    setTimeout(async () => {

        const gameData = await Database.Cache.Blackjack.get(msg.id)

        if (!gameData) return

        if (gameData.availablePlayers.length === 1) {
            await Database.Cache.Blackjack.delete(msg.id)
            return await msg.edit({
                content: `${e.Deny} | Nenhum convidado entrou nesse jogo.`,
                embeds: [{
                    color: client.red,
                    title: `${client.user.username}'s Multiplayer Blackjack`,
                    description: players.map(id => `${id === user.id ? e.Check : e.Deny} <@${id}>`).join('\n'),
                    fields: [
                        {
                            name: '📌 Status',
                            value: 'Jogo cancelado'
                        },
                        {
                            name: `${e.Info} Informações do jogo`,
                            value: `${e.baralho} ${packsAmount} Baralhos\n👥 ${players.length} Jogadores convidados${betValue > 0 ? `\n${e.MoneyWings} ${betValue} ${await guild.getCoin()} apostados` : ''}`
                        },
                        {
                            name: '⏱ Tempo',
                            value: 'Esgotado'
                        }
                    ]
                }],
                components: []
            }).catch(() => { })
        }

    }, 60000)

    return await Database.Cache.Blackjack.set(msg.id, {
        messageId: msg.id,
        userId: user.id,
        players: players,
        bet: betValue,
        availablePlayers: [user.id],
        deniedPlayers: []
    })

}