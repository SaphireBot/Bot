import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import addPointRather from "../../../commands/slashCommands/games/rather/addPoint.rather.js"
import next from './next.rather.js'

export default async (interaction, { src, bt }) => {

    if (src === 'next') return next(interaction)

    const { user, message } = interaction

    if (user.id !== message.interaction.user.id) return

    const option = {
        1: 'optionOne',
        2: 'optionTwo'
    }[bt]

    const embed = message.embeds[0]?.data

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Embed não encontrada.`,
            components: []
        }).catch(() => { })

    const newData = await addPointRather(src, option, user.id)
    const gameData = newData.find(q => q.id === src)
    const optionsFilter = newData.filter(data => ![...data.optionOne.users, ...data.optionTwo.users].includes(user.id)) || []

    const button = {
        type: 1,
        components: [{
            type: 2,
            label: optionsFilter.length === 0 ? 'Cabô' : 'Bora pra próxima',
            emoji: optionsFilter.length === 0 ? e.saphireDesespero : e.saphireRight,
            custom_id: JSON.stringify({ c: 'rt', src: 'next' }),
            style: ButtonStyle.Secondary,
            disabled: optionsFilter.length === 0
        }]
    }

    const optionOneUsersLength = gameData.optionOne.users.length
    const optionTwoUsersLength = gameData.optionTwo.users.length
    const total = optionOneUsersLength + optionTwoUsersLength
    embed.fields[0].name += ` - ${parseInt((optionOneUsersLength / total) * 100).toFixed(1)}%`
    embed.fields[1].name += ` - ${parseInt((optionTwoUsersLength / total) * 100).toFixed(1)}%`
    embed.footer = { text: `${total || 0} usuários responderam` }

    return await interaction.update({ embeds: [embed], components: [button] })
}