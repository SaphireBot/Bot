import {
    Emojis as e,
    economy
} from '../../../../../util/util.js'
import {
    SaphireClient as client,
    Database
} from '../../../../../classes/index.js'

export default async (interaction, message, gameData) => {

    const { user } = interaction
    const { embeds } = message
    const embed = embeds[0]?.data
    let dealerHandValue = 0

    do {

        dealerHandValue = gameData.dealerHand[0].value
        const RandomCard = getCard()
        gameData.dealerHand.push(RandomCard)

        for (let card of gameData.dealerHand)
            dealerHandValue += card.value

        if ([19, 20, 21].includes(dealerHandValue)) break;

    } while (dealerHandValue <= 21)

    const content = gameData.hand.map(card => card.emoji).join('') + gameData.pickUpHand.map(card => card?.emoji).join('') + '\n' + gameData.dealerHand.map(card => card?.emoji).join('')

    let atualValue = 0

    for (let card of [...gameData.pickUpHand, ...gameData.hand])
        atualValue += card.value

    embed.fields[1].value = `\`${atualValue}/21\` - ${user.username}\n\`${dealerHandValue}/21\` - Dealer`

    if (dealerHandValue > 21 || atualValue > dealerHandValue || atualValue === 21) {
        embed.color = client.green
        embed.fields[3] = {
            name: `👑 Vitória`,
            value: `Você ganhou contra o Dealer!`
        }

        if (gameData.bet > 0)
            economy.add(user.id, gameData.bet * 2)

        return editReply()
    }

    if (dealerHandValue === atualValue) {
        embed.color = client.blue
        embed.fields[3] = {
            name: `🧩 Empate`,
            value: `Você e o Dealer empatou`
        }

        if (gameData.bet > 0)
            economy.add(user.id, gameData.bet / 2)

        return editReply()
    }

    if (dealerHandValue === 21 || dealerHandValue > atualValue) {
        embed.color = client.red
        embed.fields[3] = {
            name: `${e.Deny} Derrota`,
            value: `A pontuação do Dealer foi maior que a sua.`
        }
        return editReply()
    }

    async function editReply() {
        await Database.Cache.Blackjack.delete(message.id)
        return await interaction.editReply({
            content: content,
            embeds: [embed],
            components: []
        })
    }

    function getCard() {
        const randomNumber = Math.floor(Math.random() * gameData.cards.length)
        const spliced = gameData.cards.splice(randomNumber, 1)
        return spliced[0]
    }

}