import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"
import {
    SaphireClient as client,
    Database
} from "../../../../../../classes/index.js"

export default async (interaction, optionValue) => {

    const question = await Database.Rather.findOne({ id: optionValue })

    if (!question)
        return await interaction.reply({
            content: `${e.Deny} | Questão não encontrada`,
            ephemeral: true
        })

    return await interaction.reply({
        embeds: [{
            color: client.blue,
            title: '✍ Editar questão',
            description: `Question ID: \`${question.id}\`\nQuestão respondida \`${question.optionOne.users.length || 0 + question.optionTwo.users.length || 0}\` vezes`,
            fields: [
                {
                    name: '🔵 Opção 1',
                    value: question.optionOne.question
                },
                {
                    name: '🟢 Opção 2',
                    value: question.optionTwo.question
                },
                {
                    name: '👤 Autor',
                    value: `${client.users.resolve(question.authorId)?.tag || 'Not Found'} - \`${question.authorId}\``
                }
            ],
            footer: { text: question.id }
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Editar',
                    custom_id: JSON.stringify({ c: 'redit', src: 'edit' }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Cancelar',
                    custom_id: JSON.stringify({ c: 'redit', src: 'cancel' }),
                    style: ButtonStyle.Danger
                }
            ]
        }]
    })

}