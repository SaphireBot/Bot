import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, emoji, buttons) => {

    const prize = {
        '🦤': -1000,
        '🐭': 150,
        '🦆': 5000,
        '🐒': 1000,
        '🐔': 100,
        '🐦': 500,
        '🦋': 7000
    }

    const { user, guild } = interaction
    const winPrize = prize[emoji] || 0
    const moeda = await guild.getCoin()

    if (winPrize > 0)
        Database.add(user.id, winPrize + 100, `${e.gain} Ganhou ${winPrize} Safiras em uma *raspadinha*`)

    if (winPrize === -1000)
        Database.subtract(user.id, winPrize, `${e.loss} Perdeu ${winPrize} Safiras em uma *raspadinha*`)

    const finalText = winPrize <= 0
        ? `🦤 | Você encontrou um sequência de dodos e perdeu 1000 ${moeda}`
        : `${e.Check} | Você ganhou **${winPrize} ${moeda}** achando 3 ${emoji}`

    await Database.Client.updateOne(
        { id: client.user.id },
        { $inc: { ['Raspadinhas.totalPrize']: winPrize || 0 } }
    )

    return await interaction.update({
        content: finalText,
        components: buttons
    })

}