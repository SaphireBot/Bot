import { ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { Emojis as e } from "../../../../../util/util.js";
import { Database } from "../../../../../classes/index.js";

const price = {
    "1": 2000000,
    "2": 5000000,
    "3": 10000000,
    "4": 15000000,
    "5": 20000000,
}

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    await interaction.reply({
        content: `${e.Loading} | Carregando suas informações...`
    })

    const { user } = interaction
    const userData = await Database.getUser(user.id)
    let amountStars = 0

    for (let st of Object.values(userData?.Perfil?.Estrela || {}))
        if (st) amountStars++

    const nextStar = `${amountStars + 1}`
    const starPrice = price[nextStar]

    if (!starPrice)
        return interaction.editReply({ content: `${e.Deny} | O preço da sua próxima estrela não foi encontrado.` }).catch(() => { })

    if ((userData?.Balance || 0) < starPrice)
        return interaction.editReply({
            content: `${e.Deny} | A sua próxima estrela é a de número **${nextStar}** e ela custa **${starPrice?.currency()} Safiras**.\n${e.Animated.SaphireReading} | Estou vendo aqui e você não tem todo esse dinheiro.`
        }).catch(() => { })

    return interaction.editReply({
        content: `${e.QuestionMark} | Você tem certeza que deseja gastar **${starPrice?.currency()} Safiras** na **${nextStar}° Estrela**?`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Comprar',
                        emoji: '💳',
                        custom_id: JSON.stringify({ c: 'star', src: 'buy', num: nextStar }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Desistir',
                        emoji: e.Deny,
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })
        .catch(() => { })

}