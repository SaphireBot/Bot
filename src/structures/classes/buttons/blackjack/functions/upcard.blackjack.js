import {
    SaphireClient as client,
    Database
} from '../../../../../classes/index.js'
import {
    Emojis as e,
    economy
} from '../../../../../util/util.js'

export default async (interaction, message, gameData) => {

    const { embeds } = message
    const embed = embeds[0]?.data
    const cardRandom = getCard()
    let atualValue = 0
    let passValue = 0

    for (let card of gameData.hand)
        passValue += card.value

    gameData.hand.push(cardRandom)
    const content = gameData.hand.map(card => card.emoji).join('')

    await Database.Cache.Blackjack.set(message.id, gameData)

    for (let card of gameData.hand)
        atualValue += card.value

    embed.fields[1].value = `\`${passValue}/21\` -> \`${atualValue}/21\``

    const components = message.components[0].toJSON()
    components.components[1].disabled = false
    components.components[2].disabled = false

    return await interaction.update({
        content: content,
        embeds: [embed],
        components: [components]
    })

    function getCard() {
        const randomNumber = Math.floor(Math.random() * gameData.cards.length)
        const spliced = gameData.cards.splice(randomNumber, 1)
        return spliced[0]
    }

}