import { ButtonInteraction, ButtonStyle, time } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import save from "./save.jokempo.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { value: number } } commandData
 */
export default async (interaction, commandData) => {

    const { user, message, guild } = interaction
    const MoedaCustom = await guild.getCoin()

    if (user.id !== message.interaction.user.id)
        return interaction.reply({
            content: `${e.DenyX} | Apenas quem usou o comando pode selecionar o valor. Por favor, use o comando \`/jokempo global\`.`,
            ephemeral: true
        })

    const userData = await Database.getUser(user.id)
    const balance = userData?.Balance || 0
    const { value } = commandData

    if (balance < value)
        return interaction.reply({
            content: `${e.DenyX} | Valor insuficiente. Você não tem o valor de **${value} ${MoedaCustom}** para efetuar essa aposta.`,
            ephemeral: true
        })

    await Database.User.findOneAndUpdate(
        { id: user.id },
        { $inc: { Balance: -value } },
        { upsert: true, new: true }
    )
        .then(doc => Database.saveUserCache(doc?.id, doc))

    await interaction.update({
        content: `${e.Loading} | Beleza, qual é a sua jogada para a aposta global?\n⏱️ | ${time(new Date(Date.now() + 1000 * 30), 'R')}`,
        embeds: [],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: e.pedra,
                        custom_id: 'stone',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: e.tesoura,
                        custom_id: 'scissors',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: e.papel,
                        custom_id: 'paper',
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]
    }).catch(() => { })

    return message.createMessageComponentCollector({
        filter: int => int.user.id == user.id,
        time: 1000 * 30, max: 1
    })
        .on('collect', int => save(int, { option: int.customId, value }))
        .on('end', async (_, reason) => {
            if (reason == 'time')
                return interaction.message.edit({
                    content: '⏱️ | Tempo de escolha excedido.',
                    components: []
                }).catch(() => { })

            if (['messageDelete', 'channelDelete'].includes(reason)) {
                await Database.User.findOneAndUpdate(
                    { id: user.id },
                    { $inc: { Balance: value } },
                    { upsert: true, new: true }
                )
                    .then(doc => Database.saveUserCache(doc?.id, doc))
            }

            return
        })
}