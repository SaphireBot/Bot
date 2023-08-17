import { ButtonStyle } from 'discord.js'

export default (emojis, e, memberId) => {

    const components = []
    const id = ['a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'b4', 'b5', 'c1', 'c2', 'c3', 'c4', 'c5', 'd1', 'd2', 'd3', 'd4', 'd5']
    const duplicate = [...emojis, ...emojis]
        .randomize()
        .map((emoji, i) => ({
            type: 2,
            emoji: '❔',
            custom_id: JSON.stringify({
                c: 'mg',
                src: {
                    id: id[i],
                    e: emoji,
                    mId: memberId,
                    up: 0,
                    mp: 0,
                    m: 'v'
                }
            }),
            style: ButtonStyle.Secondary
        }))

    for (let i = 0; i < 4; i++)
        components.push({ type: 1, components: duplicate.splice(0, 5) })

    return { default: components.flat() }
}