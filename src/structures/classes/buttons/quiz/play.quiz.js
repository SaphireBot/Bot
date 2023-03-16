import QuizManager from "../../../../classes/games/QuizManager.js"
import Quiz from "../../../../classes/games/Quiz.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    // TODO: Remover depois que tudo estiver pronto
    return await interaction.update({
        content: `${e.Loading} | Este comando está sob-construção. Por enquanto, estamos coletando perguntas.`,
        embeds: [],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Voltar',
                    emoji: '⬅️',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'back', userId: interaction.user.id }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Segerir uma nova categoria',
                    emoji: '📨',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'newCategory', userId: interaction.user.id }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Segurir uma nova pergunta',
                    emoji: '📨',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'newQuestion', userId: interaction.user.id }),
                    style: ButtonStyle.Primary
                }
            ]
        }]
    }).catch(() => { })

    const { channel } = interaction

    if (QuizManager.channelsInGames.includes(channel.id))
        return await interaction.reply({
            content: `${e.Deny} | Ooops, já tem um Quiz rolando nesse canal, espere ele acabar para começar outro, ok?`,
            ephemeral: true
        })

    QuizManager.channelsInGames.push(channel.id)

    return new Quiz(interaction).askPreference()

}