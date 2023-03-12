import { ButtonStyle } from "discord.js"
import QuizManager from "../../../../classes/games/QuizManager.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

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
    // TO AFK
    return await interaction.update({
        content: `${e.Loading} | Selecione o modo do Quiz de Perguntas.`,
        embeds: [],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: JSON.stringify({ c: 'quiz', src: 'gameType' }),
                placeholder: 'Escolher modo de jogo',
                options: [
                    {
                        label: 'Com Botões',
                        emoji: '🖱️',
                        description: 'Selecione a resposta correta',
                        value: 'buttons',
                    },
                    {
                        label: 'Digitando',
                        emoji: '⌨️',
                        description: 'Quem digitar a resposta mais rápido ganha',
                        value: 'keyboard'
                    },
                    {
                        label: 'Cancelar',
                        emoji: '❌',
                        description: 'Cancele a requisição de uma nova partida',
                        value: 'cancel'
                    }
                ]
            }]
        }]
    })
        .catch(() => QuizManager.unregisterChannel(channel.id))

}