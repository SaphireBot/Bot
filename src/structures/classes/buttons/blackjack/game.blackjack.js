import { Database } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'

export default async (interaction, customId) => {

    const { message, user } = interaction
    const commandAuthorId = message.interaction.user.id

    if (user.id !== commandAuthorId) return

    const gameData = await Database.Cache.Blackjack.get(message.id)

    if (!gameData)
        return await interaction.update({
            content: `${e.Deny} | Jogo não encontrado ou resgatado.`,
            embeds: [],
            components: []
        })

    const embed = message.embeds[0]?.data

    if (!embed) {
        Database.add(gameData.userId, gameData.bet, `${e.gain} Recebeu ${gameData.bet} Safiras via *Blackjack Refund*`)
        await Database.Cache.Blackjack.delete(message.id)
        return await interaction.update({
            content: `${e.Deny} | Embed do jogo não encontrada.`,
            embeds: [],
            components: []
        })
    }

    switch (customId) {
        case 'upcard': import('./functions/upcard.blackjack.js').then(upcard => upcard.default(interaction, message, gameData)); break;
        case 'stand': import('./functions/stand.blackjack.js').then(stand => stand.default(interaction, message, gameData)); break;
        case 'giveup': import('./functions/giveup.blackjack.js').then(giveup => giveup.default(interaction, message, gameData)); break;
    }

    return
}