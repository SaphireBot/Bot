import { SaphireClient as client, Database } from "../../../../../../classes/index.js"
import { economy, Emojis as e } from '../../../../../../util/util.js'

export default async (cachedData, message) => {

    const { embeds, interaction } = message
    const { amount, players } = cachedData

    if (players.length <= 1) {
        client.emit('betRefund', cachedData)
        return message.edit({
            content: `${e.Deny} | Aposta cancelada por falta de participantes.\n${e.Info} | O dinheiro foi devolvido.`,
            embeds: []
        })
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

    economy.add(winner, prize)
    await Database.Cache.Bet.delete(`Bet.${message.id}`)

    message.delete(() => { })
    message.channel.send({ embeds: [embed] })

    await Database.User.updateMany(
        { id: { $in: players.filter(id => id !== winner) } },
        {
            $push: {
                Transactions: {
                    $each: [{
                        time: `${Date.format(0, true)}`,
                        data: `${e.loss} Perdeu ${amount} Safiras em uma aposta simples`
                    }],
                    $position: 0
                }
            }
        },
        { upsert: true }
    )

    return

    function getEmoji(userId) {
        return userId === winner
            ? emojis[2]
            : userId === betAuthorId
                ? emojis[0]
                : emojis[1]
    }
}