import { ButtonStyle } from 'discord.js'
import { Emojis } from '../../../../util/util.js'
import { indexButton } from '../../../commands/functions/memorygame/util.js'

export default async (interaction, customIdData) => {

    const { user, message } = interaction
    const { id, e: emoji, mId } = customIdData
    const commandAuthor = message.interaction.user

    if (![commandAuthor.id, mId].includes(user.id)) return

    const playNow = message.mentions.members.first()
    if (!playNow || playNow.user.id !== user.id) return

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

        // emoji: '😣'
        // emoji: { name: '😣' }

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
        }, 1700)
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
                content: win
                    ? `${Emojis.Check} | <@${commandAuthor.id}>, <@${mId}>, parabéns! Vocês completaram o jogo da memória.`
                    : `${Emojis.Loading} | Tente achar os pares de emojis iguais.\n${Emojis.Info} | Clique nos botões com calma para não estragar o jogo.\n🤝 | Modo cooperativo: ${playNow.id === commandAuthor.id ? `<@${mId}>` : `<@${commandAuthor.id}>`}, é sua vez.`,
                components
            }).catch(err => invalid(err))

        return await interaction.update({
            content: win
                ? `${Emojis.Check} | <@${commandAuthor.id}>, <@${mId}>, parabéns! Vocês completaram o jogo da memória.`
                : `${Emojis.Loading} | Tente achar os pares de emojis iguais.\n${Emojis.Info} | Clique nos botões com calma para não estragar o jogo.\n🤝 | Modo cooperativo: ${playNow.id === commandAuthor.id ? `<@${mId}>` : `<@${commandAuthor.id}>`}, é sua vez.`,
            components
        }).catch(err => invalid(err))
    }

    async function invalid(err) {
        await interaction.deferUpdate().catch(() => { })

        return await message.edit({
            content: `${Emojis.Deny} | <@${commandAuthor.id}>, <@${mId}>, vocês perderam o jogo.`,
            components: components
        }).catch(() => message.delete().catch(() => { }))
    }

}