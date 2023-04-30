import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, emoji, buttons) => {

    const prize = {
        '🦤': -1000,
        '🐭': 150,
        '🦆': 5000,
        '🐒': 1000,
        '🐔': 100,
        '🐦': 500,
        '⭐': emoji === '⭐' ? await getData() : null
    }

    const { user, guild } = interaction
    const winPrize = prize[emoji] || 0
    const moeda = await guild.getCoin()

    if (winPrize > 0)
        Database.add(user.id, winPrize + 100, `${e.gain} Ganhou ${winPrize} Safiras em uma *raspadinha*`)

    if (winPrize === -1000)
        Database.subtract(user.id, winPrize, `${e.loss} Perdeu ${winPrize} Safiras em uma *raspadinha*`)

    const finalText = winPrize <= 0
        ? `${e.Animated.SaphireCry} | Você encontrou uma sequência de dodos 🦤 e perdeu 1000 ${moeda}`
        : `${e.Animated.SaphireDance} | Você ganhou **${winPrize} ${moeda}** achando 3 ${emoji}`

    return await interaction.update({
        content: finalText,
        components: buttons
    }).catch(() => { })

    async function getData() {
        const clientData = await Database.Client.findOne({ id: client.user.id }, 'Raspadinhas')
        deletePrize()
        return clientData.Raspadinhas?.totalPrize || 100
        async function deletePrize() {
            if (emoji !== '⭐') return
            await Database.Client.updateOne(
                { id: client.user.id },
                { $set: { 'Raspadinhas.totalPrize': 0 } }
            )
        }
    }

}