import { ButtonStyle } from "discord.js"
import checkAndAnalyzeButton from "./check.raspadinha.js"

export default async (interaction, customId) => {

    const { message } = interaction
    if (!message) return

    const prize = {
        '🦤': -1000,
        '🐭': 150,
        '🦆': 5000,
        '🐒': 1000,
        '🐔': 100,
        '🐦': 500,
        '🦋': 7000
    }

    const emojis = Object.keys(prize)
    const buttonIndex = {
        a1: 0, a2: 0, a3: 0, a4: 0,
        b1: 1, b2: 1, b3: 1, b4: 1,
        c1: 2, c2: 2, c3: 2, c4: 2,
        d1: 3, d2: 3, d3: 3, d4: 3
    }[customId]
    const buttons = message.components.map(components => components.toJSON())
    const button = buttons[buttonIndex].components.find(data => data.custom_id.includes(customId))

    button.emoji = { name: emojis.random() }
    button.disabled = true
    button.style = ButtonStyle.Primary

    const check = await checkAndAnalyzeButton(interaction, buttons)
    if (check === null) return

    return await interaction.update({ components: buttons })
}