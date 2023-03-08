import { ButtonStyle } from "discord.js"
import QuizManager from "../../../../../../classes/games/QuizManager.js"
import { SaphireClient as client } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"
import checkerQuiz from "../../../../../classes/buttons/quiz/checker.quiz.js"

export default async interaction => {

    if (QuizManager.channelsInGames.includes(interaction.channel.id))
        return await interaction.reply({
            content: `${e.Deny} | Já tem um Quiz rolando nesse chat, ele precisa terminar para o comando ser desbloqueado, beleza?`,
            ephemeral: true
        })

    if (interaction.options.getString('selecionar'))
        return checkerQuiz(interaction, { src: 'questionInfo' })

    return await interaction.reply({
        content: null,
        embeds: [
            {
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz`,
                description: `Estamos construindo esse Quiz com todo o amor, ok?\nVocê pode mandar perguntar clicando no botão \`Mais Opções\`.\n \nAgradecemos a sua ajuda.\n${e.Admin} Saphire's Team Developers & Resourcers Management`,
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
                    emoji: e.amongusdance,
                    custom_id: JSON.stringify({ c: 'quiz', src: 'play' }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: "Mais Opções",
                    emoji: e.saphireLendo,
                    custom_id: JSON.stringify({ c: 'quiz', src: 'options' }),
                    style: ButtonStyle.Primary
                }
            ]
        }]
    })

}