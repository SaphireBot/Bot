import { Database } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'

export default async (interaction, customId) => {

    const { message, user } = interaction
    const commandAuthorId = message.interaction.user.id

    if (user.id === commandAuthorId) return

    const gameData = await Database.Cache.Blackjack.get(message.id)

    if (!gameData)
        return await interaction.update({
            content: `${e.Deny} | Jogo não encontrado ou resgatado.`,
            embeds: [],
            components: []
        })

    const embed = message.embeds[0]?.data

    if (!embed) {
        client.emit('blackjackRefund', gameData)
        return await interaction.update({
            content: `${e.Deny} | Embed do jogo não encontrada.`,
            embeds: [],
            components: []
        })
    }

    switch (customId) {
        case 'deny': import('./functions/deny.blackjack.js').then(deny => deny.default(interaction, message, gameData)); break;
        case 'accept': import('./functions/accept.blackjack.js').then(deny => deny.default(interaction, message, gameData)); break;
    }

    return
}