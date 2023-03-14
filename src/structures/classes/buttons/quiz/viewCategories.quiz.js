import QuizManager from "../../../../classes/games/QuizManager.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

// Button Interaction
export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Ooooooopa. Essa opção são para seres superiores nomeados de **${e.ModShield} Moderadores**. Caramba, até rimou.`,
            ephemeral: true
        })

    const categories = QuizManager.categories || []
    const questions = QuizManager.questions

    if (!categories.length) {
        const embed = interaction.message.embeds[0]?.data
        if (embed) {
            embed.color = client.red
            embed.fields.push({
                name: '🫠 Nada por aqui',
                value: 'Nenhuma categoria foi encontrada'
            })
        }

        return await interaction.update({ embeds: embed ? [embed] : [], }).catch(() => { })
    }

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: `${e.QuizLogo} ${client.user.username}'s Categories Review`,
            description: categories.map((category, i) => `**${i + 1}. ${category}**`).join('\n')
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'quizOptionsData',
                placeholder: 'Selecione uma categoria',
                options: [
                    {
                        label: 'Voltar',
                        emoji: '⬅️',
                        description: 'Voltar para a primeira página',
                        value: 'back'
                    },
                    ...categories.map((category, i) => ({
                        label: category || 'Not Found',
                        emoji: '🏷️',
                        description: `${questions.filter(q => q.category == category).length || 0} perguntas nesta categoria.`,
                        value: category || `${i}-over`
                    }))
                ]
            }]
        }]
    })
}