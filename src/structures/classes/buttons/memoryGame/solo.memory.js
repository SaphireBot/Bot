import {
    Database
} from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import { indexButton } from '../../../commands/functions/memorygame/util.js'
import { ButtonStyle } from 'discord.js'

/**
 * interaction: BUTTON INTERACTION
 */
export default async (interaction, customIdData) => {

    /*
    *  id: ID do botão
    *  emoji: Emoji definido no botão
    */
    const { id, emoji } = customIdData
    const { user, message } = interaction
    const memoryGames = await Database.Cache.Memory.get(user.id) || []
    const gameData = memoryGames.find(data => data.id === message.id)

    if (!gameData)
        return await message.edit({
            content: `${e.Deny} | Jogo inválido.`,
            components: []
        })

    const components = message.components.map(components => components.toJSON())
    const allButtons = components.map(row => row.components).flat()
    const row = components[indexButton[id]]
    const button = row.components.find(button => JSON.parse(button.custom_id).src.id === id)

    button.disabled = true
    button.emoji = emoji
    button.style = ButtonStyle.Primary

    const primaryButton = allButtons.filter(buttonData => buttonData.style === ButtonStyle.Primary)
    const availableButtons = allButtons.filter(b => b.style !== ButtonStyle.Success)

    if (primaryButton?.length >= 3) return resetDefault()

    if (primaryButton.length === 2) {

        const emoji1 = primaryButton[0]?.emoji?.name || primaryButton[0]?.emoji
        const emoji2 = primaryButton[1]?.emoji?.name || primaryButton[1]?.emoji

        if (emoji1 === emoji2) {
            primaryButton[0].style = ButtonStyle.Success
            primaryButton[1].style = ButtonStyle.Success
        } else {
            for (let b of availableButtons)
                b.disabled = true
            updateDefault()
        }
    }

    return edit(allButtons.every(b => b.style === ButtonStyle.Success))

    function updateDefault() {
        setTimeout(() => {
            for (let button of availableButtons) {
                button.style = ButtonStyle.Secondary
                button.emoji = e.duvida
                button.disabled = false
            }
            return edit()
        }, 2000)
    }

    function resetDefault() {
        for (let button of availableButtons) {
            button.style = ButtonStyle.Secondary
            button.emoji = e.duvida
            button.disabled = false
        }
        return edit()
    }

    async function edit(win) {
        message.edit({
            content: win ? `${e.Check} | Jogo finalizado com sucesso.` : message.content,
            components
        })
        return await interaction.deferUpdate().catch(() => { })
    }

}