export default async (interaction, components) => {

    const { message } = interaction
    if (!message) return

    const allButtons = components.map(row => row.components).flat()

    for (let b of allButtons) {
        b.disabled = true
        b.emoji = JSON.parse(b.custom_id).src.e
    }

    interaction.deferUpdate().catch(() => { })
    return message.edit({
        content: `⏱ | Tempo expirado.`,
        components
    }).catch(() => { })
}