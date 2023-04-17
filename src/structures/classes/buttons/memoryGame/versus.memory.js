import { ButtonStyle } from 'discord.js'
import { Emojis } from '../../../../util/util.js'
import { indexButton } from '../../../commands/functions/memorygame/util.js'

export default async (interaction, customIdData) => {

    const { user, message, guild } = interaction
    const { id, e: emoji, mId } = customIdData

    const commandAuthor = message.interaction.user
    if (![commandAuthor.id, mId].includes(user.id)) return

    const playNow = message.mentions.members.first()
    if (!playNow || playNow.user.id !== user.id) return

    const member = guild.members.cache.get(mId)
    if (!member)
        return await interaction.update({
            content: `${Emojis.Deny} | Jogo inválido. Oponente não encontrado.`,
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
    const isFirstPlay = primaryButton.length === 1

    if (primaryButton?.length >= 3) return resetDefault()

    if (primaryButton.length === 2) {

        const emoji1 = primaryButton[0]?.emoji?.name || primaryButton[0]?.emoji
        const emoji2 = primaryButton[1]?.emoji?.name || primaryButton[1]?.emoji

        if (emoji1 === emoji2) {
            primaryButton[0].style = ButtonStyle.Success
            primaryButton[1].style = ButtonStyle.Success
            return await addPoint()
        }

        for (let b of availableButtons) b.disabled = true
        edit({ componentsUpdate: true })
        return resetDefault(true)
    }

    return edit({})

    function resetDefault(timeout) {

        for (let button of availableButtons) {
            button.style = ButtonStyle.Secondary
            button.emoji = '❔'
            button.disabled = false
        }

        return timeout ? setTimeout(() => edit({ replied: true }), 1700) : edit({})
    }

    async function edit({ isAccept, replied, componentsUpdate }) {

        const win = allButtons.every(b => b.style === ButtonStyle.Success)

        if (componentsUpdate)
            return await interaction.update({ components }).catch(() => { })

        if (replied)
            return await interaction.editReply({
                content: win
                    ? getFinishResponse()
                    : `${Emojis.Loading} | Tente achar os pares de emojis iguais.\n${Emojis.Info} | Clique nos botões com calma para não estragar o jogo.\n🆚 | Modo competitivo: ${getMention(isAccept)}, é sua vez.\n📉 | ${commandAuthor.tag} \`${customIdData.up}\` x \`${customIdData.mp}\` ${member.user.username}`,
                components
            }).catch(invalid)

        return await interaction.update({
            content: win
                ? getFinishResponse()
                : `${Emojis.Loading} | Tente achar os pares de emojis iguais.\n${Emojis.Info} | Clique nos botões com calma para não estragar o jogo.\n🆚 | Modo competitivo: ${getMention(isAccept)}, é sua vez.\n📉 | ${commandAuthor.tag} \`${customIdData.up}\` x \`${customIdData.mp}\` ${member.user.username}`,
            components
        }).catch(invalid)
    }

    function getMention(isAccept) {
        return isFirstPlay || isAccept
            ? playNow
            : playNow.id === commandAuthor.id ? `<@${mId}>` : `<@${commandAuthor.id}>`
    }

    async function invalid(err) {
        await interaction.deferUpdate().catch(() => { })

        return await message.edit({
            content: `${Emojis.Deny} | Ocorreu um erro nesse jogo.\n${Emojis.bug} | \`${err}\``,
            components: []
        }).catch(() => message.delete().catch(() => { }))
    }

    function addPoint() {

        for (let button of allButtons) {
            const customId = JSON.parse(button.custom_id)
            customId.src[commandAuthor.id === user.id ? 'up' : 'mp']++
            button.custom_id = JSON.stringify(customId)
        }

        customIdData[commandAuthor.id === user.id ? 'up' : 'mp']++
        return edit({ isAccept: true })
    }

    function getFinishResponse() {

        if (customIdData.up > customIdData.mp)
            return `👑 | ${commandAuthor} venceu o jogo contra ${member}\n${Emojis.Info} | Placar final: \`${customIdData.up}\` x \`${customIdData.mp}\``

        if (customIdData.mp > customIdData.up)
            return `👑 | ${member} venceu o jogo contra ${commandAuthor}\n${Emojis.Info} | Placar final: \`${customIdData.mp}\` x \`${customIdData.up}\``

        return `👑 | O jogo foi um empate, daora, daora. ${commandAuthor} & ${member} terminaram o jogo com ${customIdData.up} pontos.`
    }

}