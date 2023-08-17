import Quiz from "../../../../classes/games/QuizManager.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Epa epa epa! Apenas a minha staff pode entrar aqui, ok?`,
            ephemeral: true
        })

    return await interaction.update({
        content: null,
        embeds: [{
            color: client.blue,
            title: `${e.QuizLogo} ${client.user.username}'s Quiz Manager Request`,
            description: "Funções exclusivas da Saphire's Team"
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'quizOptions',
                placeholder: 'Opções disponíveis',
                options: [
                    {
                        label: 'Voltar para a página inicial',
                        emoji: '⬅️',
                        description: 'Voltar para o começo, lá pro início',
                        value: 'back'
                    },
                    {
                        label: 'Visualizar Categorias Ativas',
                        emoji: '🔎',
                        description: `${Quiz.categories.length} categorias salvas no banco de dados`,
                        value: 'viewCategories'
                    },
                    {
                        label: 'Analisar Reportes',
                        emoji: '🔎',
                        description: `${Quiz.reports.length} reportes em espera`,
                        value: 'reviewReports'
                    },
                    {
                        label: 'Analisar Categorias',
                        emoji: '🔎',
                        description: `${Quiz.CategoriesIndications.length} categorias em espera`,
                        value: 'reviewCategory'
                    },
                    {
                        label: 'Analisar Perguntas',
                        emoji: '🔎',
                        description: `${Quiz.QuestionsIndications.length} perguntas em espera`,
                        value: 'reviewQuestion'
                    }
                ]
            }]
        }]
    })
}