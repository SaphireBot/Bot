import QuizManager from "../../../../../../classes/games/QuizManager.js"
import checkerQuiz from "../../../../../classes/buttons/quiz/checker.quiz.js"
import { SaphireClient as client } from "../../../../../../classes/index.js"
import { Buttons, Emojis as e } from "../../../../../../util/util.js"

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
                description: `\nHey hey, tudo bem? ${e.amongusdance}\nEste é um Quiz de perguntas que você pode escolher como jogar.`,
                fields: [
                    {
                        name: '🖌️ Personalizar',
                        value: 'Você pode escolher até 6 configurações. Ou seja,\nsão um total de **63 configurações** possíveis.'
                    },
                    {
                        name: `${e.jumpStar} Créditos`,
                        value: 'Os devidos créditos devem ser dados para aqueles que contribuem, certo?'
                    },
                    {
                        name: '📨 Sugerir perguntas/categorias',
                        value: 'Sim, sim. Aqui você pode enviar perguntas e novas categorias para a Saphire\'s Team aceitar.\nAqui, quem faz o Quiz, são os próprios usuários.'
                    },
                    {
                        name: '🏷️ Categorias',
                        value: 'Cada pergunta, tem sua categoria. Você pode escolher quais categorias você quer no seu Quiz em `Personalizar`.'
                    }
                ],
                thumbnail: {
                    url: 'https://media.discordapp.net/attachments/893361065084198954/1084184092616183898/i-have-an-idea-light-bulb-icon-motion-design-animation_49.gif?width=624&height=468'
                },
                footer: {
                    text: `❤️ Powered By: ${client.user.username}'s Community`
                }
            }
        ],
        components: Buttons.QuizQuestionsFirstPage(interaction.user.id)
    })

}