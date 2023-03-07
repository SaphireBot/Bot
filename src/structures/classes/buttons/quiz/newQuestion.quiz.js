import Quiz from "../../../../classes/games/Quiz.js";
import { ButtonStyle } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";

export default async interaction => {

    const { questions, categories } = Quiz

    if (!categories.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma categoria foi encontrada.`,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Indicar uma nova categoria",
                        custom_id: JSON.stringify({ c: 'quiz', src: 'newCategory' }),
                        style: ButtonStyle.Success
                    }
                ]
            }]
        })

    if (categories.length > 25) categories.length = 25

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'quizOptions',
            placeholder: 'Selecionar uma categoria',
            options: [
                ...categories.map(categoryName => ({
                    label: `${categoryName}`,
                    emoji: '🏷️',
                    description: `${questions.filter(q => q.category == categoryName)?.length || 0} perguntas nesta categoria`,
                    value: `${categoryName}`
                }))
            ]
        }]
    }

    return await interaction.reply({
        content: `${e.CheckV} | Tudo ok! Agora é só escolher para qual categoria você quer mandar sua pergunta.`,
        embeds: [], ephemeral: true,
        components: [
            selectMenuObject,
            {
                type: 1,
                components: [{
                    type: 2,
                    label: 'Sugerir uma nova categoria',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'newCategory' }),
                    style: ButtonStyle.Primary
                }]
            }
        ]
    }).catch(() => { })

}