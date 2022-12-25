import { Database, SaphireClient as client } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"
import realizeBet from './realize.bet.js'

export default async (cachedData, message, userId, finalize) => {

    const returnedData = await Database.Cache.Bet.push(`Bet.${message.id}.players`, userId)
    const allBets = Object.entries(returnedData || {})
    const thisBet = allBets.find(([messageId]) => messageId === message.id)
    const newPlayers = thisBet[1].players
    const embed = message.embeds[0].data
    const emojis = [e.OwnerCrow, '👤']

    if (!embed) {
        client.emit('betRefund', cachedData)
        return await message.edit({
            content: `${e.Deny} | Embed da aposta não encontrada.\n${e.Info} | Dinheiro devolvido a todos os participantes.`,
            embeds: []
        })
    }

    const betAuthorId = message.interaction.user.id

    embed.fields[0] = {
        name: `👥 Jogadores - ${newPlayers.length}/${cachedData.playersCount}`,
        value: newPlayers
            .map(id => `${id === betAuthorId ? emojis[0] : emojis[1]} <@${id}>`)
            .join('\n')
            .limit('MessageEmbedFieldValue')
    }

    const sucess = await message.edit({ embeds: [embed] })
        .catch(() => null)

    if (sucess === null) {
        client.emit('betRefund', cachedData)
        return message.channel.send({
            content: `${e.Deny} | Não foi possível editar a embed da aposta.\n${e.Info} | Todos os usuários teve seu dinheiro devolvido.`
        })
    }

    Database.subtract(userId, cachedData.amount)
    if (finalize) return realizeBet(await Database.Cache.Bet.get(`Bet.${message.id}`), message)

}