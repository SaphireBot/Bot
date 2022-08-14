import { ButtonStyle } from 'discord.js'

export default (emojis, e, messageId) => {

    const components = []
    const id = ['a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'b4', 'b5', 'c1', 'c2', 'c3', 'c4', 'c5', 'd1', 'd2', 'd3', 'd4', 'd5']
    const duplicate = [...emojis, ...emojis]
        .randomize()
        .map((emoji, i) => ({
            type: 2,
            emoji: e.duvida,
            custom_id: JSON.stringify({
                c: 'memory',
                src: {
                    id: id[i],
                    msgId: messageId,
                    emoji: emoji
                }
            }),
            style: ButtonStyle.Secondary
        }))

    for (let i = 0; i < 4; i++)
        components.push({ type: 1, components: duplicate.splice(0, 5) })

    const alreadyUsed = []
    const originalOrder = {
        a1: getEmojis(), a2: getEmojis(), a3: getEmojis(), a4: getEmojis(), a5: getEmojis(),
        b1: getEmojis(), b2: getEmojis(), b3: getEmojis(), b4: getEmojis(), b5: getEmojis(),
        c1: getEmojis(), c2: getEmojis(), c3: getEmojis(), c4: getEmojis(), c5: getEmojis(),
        d1: getEmojis(), d2: getEmojis(), d3: getEmojis(), d4: getEmojis(), d5: getEmojis()
    }

    return { default: components.flat(), perId: originalOrder }

    function getEmojis() {
        const emoji = emojis.random()
        const test = alreadyUsed.filter(data => data === emoji)

        if (test.length >= 2) return getEmojis()
        alreadyUsed.push(emoji)
        return emoji
    }
}