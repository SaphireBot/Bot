import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../util/util.js"
import { Database } from "../../../../../classes/index.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    const { options, user } = interaction
    const optionDate = options.getString('time')
    const userDonate = options.getUser('donate')

    if (userDonate?.bot)
        return interaction.reply({
            content: `${e.Deny} | Você não pode doar VIP para um bot.`,
            ephemeral: true
        })

    const oneDay = 1000 * 60 * 60 * 24
    const data = {
        week: {
            time: oneDay * 7,
            price: 150000,
            text: 'Uma Semana (7 Dias)'
        },
        month: {
            time: oneDay * 30,
            price: 500000,
            text: 'Um Mês (30 Dias)'
        },
        year: {
            time: oneDay * 365,
            price: 5000000,
            text: 'Um Ano (365 Dias)'
        }
    }[optionDate]

    await interaction.reply({ content: `${e.Loading} | Carregando seus dados...` })

    if (!data)
        return interaction.editReply({
            content: `${e.Animated.SaphirePanic} | Nenhum tempo definido foi definido definitivamente. OMG!`
        }).catch(() => { })

    const userData = await Database.getUser(user.id)

    if (userData?.Balance < data.price)
        return interaction.editReply({
            content: `${e.Deny} | Você precisa de pelo menos **${data.price.currency()} safiras** para comprar este vip.`,
        }).catch(() => { })

    const content = userDonate
        ? `${e.Loading} | Você tem certeza que deseja doar **${data.text}** de vip para ${userDonate} por **${data.price.currency()} Safiras**?`
        : `${e.Loading} | Você tem certeza que deseja comprar o vip de **${data.text}** por **${data.price.currency()} Safiras**?`

    return interaction.editReply({
        content,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Confirmar',
                        custom_id: JSON.stringify({ c: 'vip', src: 'confirm', type: optionDate, dnt: userDonate.id }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        custom_id: JSON.stringify({ c: 'vip', src: 'cancel' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    }).catch(() => { })
}