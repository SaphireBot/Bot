import { ButtonStyle, parseEmoji } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default (mines = 0) => {

    let buttonId = 0
    const buttons = []
    let emojis = []

    for (let i = 0; i <= 24; i++) {
        mines > 0 ? emojis.push(1) : emojis.push(0)
        mines--
    }

    emojis = emojis.sort(() => Math.random() - Math.random())

    for (let a = 0; a <= 3; a++) {
        const keyLetter = ['a', 'b', 'c', 'd'][a]
        const button = { type: 1, components: [] }
        for (let i = 0; i <= 4; i++)
            button.components.push({
                type: 2,
                emoji: parseEmoji(e.Animated.SaphireQuestion),
                custom_id: JSON.stringify({ c: 'bet', src: 'multi', type: 'game', id: `${keyLetter}${buttonId++}`, e: emojis[buttonId] }),
                style: ButtonStyle.Secondary
            })

        buttons.push(button)
    }

    buttons.push({
        type: 1,
        components: [
            ...[1, 2, 3, 4].map(() => ({
                type: 2,
                emoji: parseEmoji(e.Animated.SaphireQuestion),
                custom_id: JSON.stringify({ c: 'bet', src: 'multi', type: 'game', id: `e${buttonId++}`, e: emojis[buttonId] }),
                style: ButtonStyle.Secondary
            })),
            {
                type: 2,
                label: 'Parar',
                custom_id: JSON.stringify({ c: 'bet', src: 'multi', type: 'game', id: 'finish' }),
                style: ButtonStyle.Primary
            }
        ]
    })

    return buttons
}