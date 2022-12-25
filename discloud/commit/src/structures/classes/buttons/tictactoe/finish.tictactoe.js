export default async ({ winResponse, author, opponent, components, interaction }) => {

    disableAll()

    if (winResponse === true)
        return await interaction.update({
            content: `👵 | <@${author}>, <@${opponent}>, deu velha.`,
            components
        })

    const winner = {
        '❌': author,
        '⭕': opponent
    }[winResponse]

    return await interaction.update({
        content: `👑 | <@${winner}> ganhou o jogo.`,
        components
    })

    function disableAll() {
        const allButtons = components.map(row => row.components).flat()
        for (let button of allButtons) button.disabled = true
    }

}