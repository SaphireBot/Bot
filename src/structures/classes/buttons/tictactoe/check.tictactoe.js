export default (components, allButtons) => {

    const a1 = components[0].components[0].emoji?.name || components[0].components[0].emoji
    const a2 = components[0].components[1].emoji?.name || components[0].components[1].emoji
    const a3 = components[0].components[2].emoji?.name || components[0].components[2].emoji
    const b1 = components[1].components[0].emoji?.name || components[1].components[0].emoji
    const b2 = components[1].components[1].emoji?.name || components[1].components[1].emoji
    const b3 = components[1].components[2].emoji?.name || components[1].components[2].emoji
    const c1 = components[2].components[0].emoji?.name || components[2].components[0].emoji
    const c2 = components[2].components[1].emoji?.name || components[2].components[1].emoji
    const c3 = components[2].components[2].emoji?.name || components[2].components[2].emoji
    const emojis = ['❌', '⭕']

    const possibilities = [
        [a1, a2, a3],
        [b1, b2, b3],
        [c1, c2, c3],
        [a1, b1, c1],
        [a2, b2, c2],
        [a3, b3, c3],
        [a1, b2, c3],
        [a3, b2, c1]
    ]

    for (const array of possibilities) {

        const authorWin = array.every(emoji => emoji === emojis[0])
        const userWin = array.every(emoji => emoji === emojis[1])

        if (authorWin) return emojis[0]
        if (userWin) return emojis[1]

        continue
    }

    if (allButtons.every(button => button.disabled === true)) return true
    return false

}