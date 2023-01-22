import { Emojis as e } from '../../../../../util/util.js'
import { Database } from '../../../../../classes/index.js'

export default async (interaction, message, gameData) => {

    const { user, guild } = interaction
    const { embeds } = message
    const commandAuthorId = message.interaction.user.id
    const embed = embeds[0]?.data

    if (gameData.availablePlayers.includes(user.id))
        return await interaction.reply({
            content: `${e.Info} | Você já aceitou este jogo.`,
            ephemeral: true
        })

    if (gameData.bet > 0) {
        const userData = await Database.User.findOne({ id: user.id }, 'Balance')
        const userMoney = userData?.Balance || 0
        if (!userMoney || userMoney < gameData.bet)
            return await interaction.reply({
                content: `${e.Deny} | Ainda falta mais **${gameData.bet - userMoney} ${await guild.getIcon()}** para você poder entrar nesta aposta.`,
                ephemeral: true
            })

        Database.subtract(user.id, gameData.bet, `${e.loss} Apostou ${gameData.bet} Safiras em um *Blackjack Multiplayer*.`)
    }

    if (gameData.deniedPlayers.includes(user.id))
        gameData.deniedPlayers = gameData.deniedPlayers.filter(id => id !== user.id)

    gameData.availablePlayers.push(user.id)

    // if (gameData.availablePlayers.length === gameData.players.length) {
    //     startGame()
    // }

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