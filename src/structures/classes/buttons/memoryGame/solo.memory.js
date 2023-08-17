import { Emojis } from '../../../../util/util.js'
import { indexButton } from '../../../commands/functions/memorygame/util.js'
import { ButtonStyle } from 'discord.js'
import disable from './disable.memory.js'
import coopMode from './coop.memory.js'
import versusMode from './versus.memory.js'

/**
 * interaction: BUTTON INTERACTION
 */
export default async (interaction, customIdData) => {

    /*
    *  id: ID do botão
    *  emoji: Emoji definido no botão
    *  d: Date.now() + 120000 do limited mode
    */
    const { id, e: emoji, d, mId, m } = customIdData

    if (m === 'v') return versusMode(interaction, customIdData)
    if (mId) return coopMode(interaction, customIdData)

    const { message } = interaction
    const components = message.components.map(components => components.toJSON())
    const allButtons = components.map(row => row.components).flat()
    const row = components[indexButton[id]]
    const button = row.components.find(button => JSON.parse(button.custom_id).src.id === id)

    if (d && d < Date.now()) return invalid(true)

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
            for (let b of availableButtons) b.disabled = true
            updateDefault()
        }
    }

    return edit(allButtons.every(b => b.style === ButtonStyle.Success))

    function updateDefault() {
        setTimeout(() => {
            for (let button of availableButtons) {
                button.style = ButtonStyle.Secondary
                button.emoji = '❔'
                button.disabled = false
            }
            return edit()
        }, 1000)
    }

    function resetDefault() {
        for (let button of availableButtons) {
            button.style = ButtonStyle.Secondary
            button.emoji = '❔'
            button.disabled = false
        }
        return edit()
    }

    async function edit(win) {

        if (interaction.replied)
            return await interaction.editReply({
                content: win ? `${Emojis.Check} | Jogo finalizado com sucesso.` : message.content,
                components
            }).catch(err => invalid(err))

        return await interaction.update({
            content: win ? `${Emojis.Check} | Jogo finalizado com sucesso.` : message.content,
            components
        }).catch(err => invalid(err))
    }

    async function invalid(timeout) {

        if (timeout) return disable(interaction, components)

        await interaction.deferUpdate().catch(() => { })

        return await message.edit({
            content: timeout ? `⏱ | Tempo esgotado.` : `${Emojis.Deny} | Jogo inválido.`,
            components: timeout ? components : []
        }).catch(() => message.delete().catch(() => { }))
    }

}