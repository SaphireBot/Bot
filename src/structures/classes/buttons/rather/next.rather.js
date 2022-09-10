import { ButtonStyle } from "discord.js"
import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction) => {

    // return await interaction.reply({ content: `${e.Info} | Este jogo precisa de mais perguntas. Mande sua sugestão usando </rather suggest:${interaction.commandId}>` })

    const { user } = interaction
    const allGameData = await Database.Rather.find({})

    if (!allGameData || !allGameData.length)
        return await interaction.update({
            content: `${e.Deny} | Nenhuma pergunta foi encontrada.`,
            components: []
        }).catch(() => { })

    const optionsFilter = allGameData.filter(data => ![...data.optionOne.users, ...data.optionTwo.users].includes(user.id))

    // TODO: Modo sem addPoint
    if (!optionsFilter || !optionsFilter.length)
        return await interaction.update({
            content: `${e.Info} | Você já respondeu todas as perguntas presentes no banco de dados.`,
            components: []
        }).catch(() => { })

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: `${e.QuestionMark} O que você prefere?`,
            fields: [
                {
                    name: '🔵 Opção 1',
                    value: optionsFilter[0].optionOne.question
                },
                {
                    name: '🟢 Opção 2',
                    value: optionsFilter[0].optionTwo.question
                }
            ]
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Opção 1',
                    custom_id: JSON.stringify({ c: 'rt', src: optionsFilter[0].id, bt: 1 }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Opção 2',
                    custom_id: JSON.stringify({ c: 'rt', src: optionsFilter[0].id, bt: 2 }),
                    style: ButtonStyle.Success
                }
            ]
        }]
    })

}