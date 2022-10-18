import { Emojis as e } from '../../../../../util/util.js'
import {
    SaphireClient as client,
    Database
} from '../../../../../classes/index.js'

export default async (interaction, message, gameData) => {

    const { user, guild } = interaction
    const { embeds } = message
    const embed = embeds[0]?.data
    const cardRandom = getCard()
    let atualValue = 0

    gameData.pickUpHand.push(cardRandom)
    const content = gameData.hand.map(card => card.emoji).join('') + gameData.pickUpHand.map(card => card?.emoji).join('')

    for (let card of [...gameData.pickUpHand, ...gameData.hand])
        atualValue += card.value

    embed.fields[1].value = `\`${gameData.hand[0].value}/21\` -> \`${atualValue}/21\` - ${user.username}`

    let components = message.components[0].toJSON()
    components.components[1].disabled = false

    if (atualValue > 21) {
        embed.color = client.red
        components = null
        embed.fields[2].value = embed.fields[2].value + ` -> 0 ${await guild.getCoin()}`
        embed.fields[3] = {
            name: `${e.Deny} Passou de 21`,
            value: `Você estorou o limite de 21 pontos e perdeu o jogo.`
        }
        await Database.Cache.Blackjack.delete(message.id)
    }
    else await Database.Cache.Blackjack.set(message.id, gameData)

    return await interaction.update({
        content: content,
        embeds: [embed],
        components: components === null ? [] : [components]
    })

    function getCard() {
        const randomNumber = Math.floor(Math.random() * gameData.cards.length)
        const spliced = gameData.cards.splice(randomNumber, 1)
        return spliced[0]
    }

}