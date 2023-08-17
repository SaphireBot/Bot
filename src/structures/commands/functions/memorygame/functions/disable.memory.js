import { ButtonStyle } from 'discord.js'

export default (message, date) => {

    return setTimeout(() => disable(), date)

    async function disable() {
        
        const trueMessage = await message.fetch()
        if (!trueMessage) return

        const components = trueMessage.components.map(components => components.toJSON())
        const allButtons = components.map(row => row.components).flat()

        const allGreen = allButtons.every(b => b.style === ButtonStyle.Success)
        if (allGreen) return

        for (let b of allButtons) {
            b.disabled = true
            b.emoji = JSON.parse(b.custom_id).src.e
        }

        return message.edit({
            content: `⏱ | Tempo expirado.`,
            components
        })
    }

}