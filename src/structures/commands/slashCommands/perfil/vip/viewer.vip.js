import { ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../util/util.js"
import { Database } from "../../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { user: interactionUser, options } = interaction
    const user = options.getUser('user') || interactionUser

    await interaction.reply({ content: `${e.Loading} | Carregando os dados...` })

    const data = await Database.getUser(user.id)
    const vipData = data?.Vip || {}

    if (vipData?.Permanent)
        return interaction.editReply({
            content: `${e.Animated.SaphireReading} | ${user.id == interactionUser.id ? "Você" : user} tem o vip permanente.`
        }).catch(() => { })

    if (
        !vipData
        || !vipData.DateNow
        || !vipData.TimeRemaing
    )
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | ${user.id == interactionUser.id ? "Você" : user} não tem o vip ativo.`
        }).catch(() => { })

    const time = vipData.DateNow + vipData.TimeRemaing

    return interaction.editReply({
        content: `${e.Animated.SaphireReading} | ${user.id == interactionUser.id ? "Você" : user} tem o vip até ${Date.complete(new Date(time).valueOf())} (${Date.Timestamp(new Date(time - Date.now()).valueOf(), 'R')}).`
    }).catch(() => { })
}