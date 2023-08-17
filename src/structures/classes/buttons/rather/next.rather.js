import { ButtonStyle } from "discord.js"
import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction) => {

    const { user, message } = interaction
    if (user.id !== message.interaction.user.id) return

    const allGameData = await Database.Rather.find({})

    if (!allGameData || !allGameData.length)
        return await interaction.update({
            content: `${e.Deny} | Nenhuma pergunta foi encontrada.`,
            components: []
        }).catch(() => { })

    const optionsFilter = allGameData.filter(data => ![...data.optionOne.users, ...data.optionTwo.users].includes(user.id)) || []
    const question = optionsFilter.length > 0 ? optionsFilter.random() : allGameData.random()
    const starOne = question.optionOne.users.includes(user.id) ? '⭐' : null
    const starTwo = question.optionTwo.users.includes(user.id) ? '⭐' : null
    const userFetch = await client.users.fetch(question.authorId).catch(() => null)
    const userTag = userFetch?.username || 'Not Found'

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: `${e.QuestionMark} O que você prefere?`,
            fields: [
                {
                    name: '🔵 Opção 1',
                    value: question.optionOne.question
                },
                {
                    name: '🟢 Opção 2',
                    value: question.optionTwo.question
                }
            ],
            footer: { text: `Questão por: ${userTag}` }
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Opção 1',
                    emoji: starOne,
                    custom_id: JSON.stringify({ c: 'rt', src: question.id, bt: 1 }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Opção 2',
                    emoji: starTwo,
                    custom_id: JSON.stringify({ c: 'rt', src: question.id, bt: 2 }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Sugerir uma questão',
                    emoji: e.Animated.SaphireReading,
                    custom_id: JSON.stringify({ c: 'rt', src: 'suggest', bt: 1 }),
                    style: ButtonStyle.Secondary
                }
            ]
        }]
    })

}