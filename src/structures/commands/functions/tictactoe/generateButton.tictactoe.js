import { ButtonStyle } from 'discord.js'

export default (opponentId, authorId) => {

    /**
     * A1 A2 A3
     * B1 B2 B3
     * C1 C2 C3
     */

    const components = []
    const id = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3']
    const buttons = id.map(id => ({
        type: 2,
        emoji: '➖',
        custom_id: JSON.stringify({
            c: 'ttt',
            src: {
                id: id,
                opponent: opponentId,
                authorId
            }
        }),
        style: ButtonStyle.Secondary
    }))

    for (let i = 0; i < 3; i++)
        components.push({ type: 1, components: buttons.splice(0, 3) })

    return components.flat()

}