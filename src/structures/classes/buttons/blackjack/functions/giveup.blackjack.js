import { Database, SaphireClient as client } from '../../../../../classes/index.js'
import { economy, Emojis as e } from '../../../../../util/util.js'

export default async (interaction, message, gameData) => {

    const { user } = interaction
    const { embeds } = message
    const embed = embeds[0]?.data
    let atualValue = [...gameData.pickUpHand, ...gameData.hand].reduce((acc, card) => acc += card.value, 0)

    embed.fields[1].value = `\`${atualValue}/21\` - ${user.username}\n\`${gameData.dealerHand[0].value}/21\` - Dealer`
    embed.color = client.red
    const content = message.content + '\n' + gameData.dealerHand.map(card => card?.emoji).join('')

    embed.fields[3] = {
        name: `${e.saphireDesespero} Desistência`,
        value: 'Você desistiu do jogo.'
    }

    if (gameData.bet > 0)
        economy.add(user.id, gameData.bet)

    await Database.Cache.Blackjack.delete(message.id)

    await interaction.update({ content: content, embeds: [embed], components: [] })

}