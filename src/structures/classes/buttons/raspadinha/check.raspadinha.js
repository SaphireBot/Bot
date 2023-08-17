import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import win from "./win.raspadinha.js"

export default async (interaction, buttons) => {

    const a1 = buttons[0].components[0]
    const a2 = buttons[0].components[1]
    const a3 = buttons[0].components[2]
    const a4 = buttons[0].components[3]
    const b1 = buttons[1].components[0]
    const b2 = buttons[1].components[1]
    const b3 = buttons[1].components[2]
    const b4 = buttons[1].components[3]
    const c1 = buttons[2].components[0]
    const c2 = buttons[2].components[1]
    const c3 = buttons[2].components[2]
    const c4 = buttons[2].components[3]
    const d1 = buttons[3].components[0]
    const d2 = buttons[3].components[1]
    const d3 = buttons[3].components[2]
    const d4 = buttons[3].components[3]
    const allButtons = [a1, a2, a3, a4, b1, b2, b3, b4, c1, c2, c3, c4, d1, d2, d3, d4]

    /* Constructor
     * a1 a2 a3 a4
     * b1 b2 b3 b4
     * c1 c2 c3 c4
     * d1 d2 d3 d4
     */

    const winCondicionals = [
        [a1, a2, a3], [a1, b1, c1], [a1, b2, c3],
        [a2, a3, a4], [a2, b2, c2], [a2, b3, c4],
        [a3, b3, c3], [a3, b2, c1], [a4, b4, c4],
        [a4, b3, c2], [b1, b2, b3], [b1, c1, d1],
        [b1, c2, d3], [b2, c2, d2], [b2, b3, b4],
        [b2, c3, d4], [b3, c3, d3], [b3, c2, d1],
        [b4, c4, d4], [b4, c3, d2], [c1, c2, c3],
        [c2, c3, c4], [d1, d2, d3], [d2, d3, d4]
    ]

    for await (let condicional of winCondicionals) {
        if (condicional.every(data => data.emoji.name === condicional[0].emoji.name && data.emoji.name !== 'raspadinha')) {
            for (let button of condicional)
                button.style = button.emoji.name == '🦤' ? ButtonStyle.Danger : ButtonStyle.Success

            disableAllButtons()
            win(interaction, condicional[0].emoji.name, buttons)
            return null
        }
    }

    if (
        allButtons.every(button => button.style === ButtonStyle.Primary)
        || allButtons.every(button => button.disabled === true)
    ) {
        disableAllButtons()
        await interaction.update({
            content: `${e.Animated.SaphireCry} | Que pena, você não ganhou nada nessa raspadinha`,
            components: buttons
        }).catch(() => { })
        return null
    }

    return true

    function disableAllButtons() {
        for (let button of allButtons)
            if (!button.disabled) button.disabled = true
    }
}