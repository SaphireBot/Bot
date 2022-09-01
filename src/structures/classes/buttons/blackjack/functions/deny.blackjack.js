import { economy, Emojis as e } from '../../../../../util/util.js'
import {
    SaphireClient as client,
    Database
} from '../../../../../classes/index.js'

export default async (interaction, message, gameData) => {

    const { user } = interaction
    const { embeds } = message
    const commandAuthorId = message.interaction.user.id
    const embed = embeds[0]?.data

    if (gameData.availablePlayers.includes(user.id)) {

        if (gameData.bet > 0) economy.add(user.id, gameData.bet)

        gameData.availablePlayers = gameData.availablePlayers.filter(id => id !== user.id)
    }

    if (gameData.deniedPlayers.includes(user.id))
        return await interaction.reply({
            content: `${e.Info} | Você já recusou este jogo.`,
            ephemeral: true
        })

    gameData.deniedPlayers.push(user.id)

    if (gameData.deniedPlayers.length === gameData.players?.length - 1) {
        embed.description = gameData.players.map(id => `${id === commandAuthorId ? e.Check : e.Deny} <@${id}>`).join('\n')
        embed.fields[0].value = 'Jogo cancelado'
        embed.fields.pop()
        embed.color = client.red
        client.emit('blackjackRefund', gameData)

        return await interaction.update({
            content: null,
            embeds: [embed],
            components: []
        })
    }

    await Database.Cache.Blackjack.set(message.id, gameData)

    embed.description = gameData.players.map(id => `${getEmoji(id)} <@${id}>`).join('\n')

    return await interaction.update({
        content: null,
        embeds: [embed]
    })

    function getEmoji(id) {

        const accepted = gameData.availablePlayers
        const denied = gameData.deniedPlayers

        if (id === commandAuthorId || accepted.includes(id)) return e.Check
        if (denied.includes(id)) return e.Deny

        return e.Loading
    }

}