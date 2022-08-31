import { Database } from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'

export default async (interaction, message, gameData) => {

    const { user } = interaction
    const { embeds } = message
    const embed = embeds[0]?.data
    let atualValue = 0

    for (let card of [...gameData.pickUpHand, ...gameData.hand])
        atualValue += card.value

    gameData.hand.push(...gameData.pickUpHand)
    gameData.pickUpHand = []

    embed.fields[1].value = `\`${atualValue}/21\` - ${user.username}\n\`${gameData.dealerHand[0].value}/21\` - ${e.Loading} Dealer...`
    const content = message.content + '\n' + gameData.dealerHand.map(card => card?.emoji).join('')

    await Database.Cache.Blackjack.set(message.id, gameData)

    await interaction.update({
        content: content,
        embeds: [embed],
        components: []
    })

    return setTimeout(() => import('./dealer.blackjack.js').then(dealer => dealer.default(interaction, message, gameData)), 3000)
}