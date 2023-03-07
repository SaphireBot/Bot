import { ButtonStyle } from "discord.js"
import { SaphireClient as client } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"
import checkerQuiz from "../../../../../classes/buttons/quiz/checker.quiz.js"

export default async interaction => {

    return await interaction.reply({
        content: `${e.Loading} | Calma calma... Esse comando está sob um grandiosa construção.`,
        ephemeral: true
    })

    if (interaction.options.getString('selecionar'))
        return checkerQuiz(interaction, { src: 'questionInfo' })

    return await interaction.reply({
        embeds: [
            {
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz`,
                footer: {
                    text: `❤️ Powered By: ${client.user.username}'s Community`
                }
            }
        ],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: "Jogar",
                    custom_id: JSON.stringify({ c: 'quiz', src: 'play' }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: "Mais Opções",
                    custom_id: JSON.stringify({ c: 'quiz', src: 'options' }),
                    style: ButtonStyle.Primary
                }
            ]
        }]
    })

}