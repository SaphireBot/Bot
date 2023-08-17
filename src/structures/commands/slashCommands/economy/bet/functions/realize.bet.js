import { SaphireClient as client, Database } from "../../../../../../classes/index.js"
import { Emojis as e } from '../../../../../../util/util.js'
import { socket } from "../../../../../../websocket/websocket.js"

export default async (cachedData, message) => {

    const { embeds, interaction } = message
    const { amount, players } = cachedData

    if (players.length <= 1) {
        client.emit('betRefund', cachedData)
        message.reactions.removeAll().catch(() => { })
        return message.edit({
            content: `${e.Deny} | Aposta cancelada por falta de participantes.\n${e.Info} | O dinheiro foi devolvido.`,
            embeds: []
        }).catch(() => { })
    }

    const winner = players.random()
    const prize = parseInt(amount * players.length)
    const embed = embeds[0]?.data
    const emojis = [e.OwnerCrow, '👤', '🎉']
    const betAuthorId = interaction.user.id

    if (!embed)
        return await message.edit({
            content: `${e.Deny} | Finalização corrompida.`
        }).catch(() => { })

    embed.color = client.green
    embed.title = `${embed.title} - Finalizada`
    embed.fields[0].value = players
        .map(id => `${getEmoji(id)} <@${id}>`)
        .join('\n')
        .limit('MessageEmbedFieldValue')

    embed.fields[2] = {
        name: `${e.Info} Resultado`,
        value: `<@${winner}> ganhou ${prize} ${await message.guild.getCoin()}`
    }

    Database.add(winner, prize)
    await Database.Cache.Bet.delete(message.id)

    message.delete(() => { })
    message.channel.send({ embeds: [embed] }).catch(() => { })

    const usersId = players.filter(id => id !== winner)

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.loss} Perdeu ${amount} Safiras em uma aposta simples`
    }

    for (const userId of usersId)
        socket?.send({
            type: "transactions",
            transactionsData: { value: amount, userId, transaction }
        })

    await Database.User.updateMany(
        { id: { $in: players.filter(id => id !== winner) } },
        {
            $push: {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            }
        },
        { upsert: true }
    )
    Database.refreshUsersData(players.filter(id => id !== winner))
    return

    function getEmoji(userId) {
        return userId === winner
            ? emojis[2]
            : userId === betAuthorId
                ? emojis[0]
                : emojis[1]
    }
}