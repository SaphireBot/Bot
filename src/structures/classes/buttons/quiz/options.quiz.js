import Quiz from "../../../../classes/games/Quiz.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    if (interaction.user.id !== interaction.message?.interaction?.user?.id)
        return await interaction.reply({
            content: `${e.DenyX} | Epa epa, só <@${interaction.message?.interaction?.user?.id}> pode usar essa função, beleza?`,
            ephemeral: true
        })

    const components = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'quizOptions',
            placeholder: 'Opções disponíveis',
            options: [
                {
                    label: 'Indicar nova categoria',
                    emoji: '📨',
                    description: 'Indique uma nova categoria',
                    value: 'newCategory',
                },
                {
                    label: 'Indicar nova pergunta',
                    emoji: '📨',
                    description: 'Indique uma nova pergunta',
                    value: 'newQuestion'
                },
                {
                    label: 'Jogar',
                    emoji: "🧩",
                    description: "Iniciar uma partida do quiz",
                    value: 'play'
                },
                {
                    label: 'Voltar para a página inicial',
                    emoji: '⬅️',
                    description: 'Voltar para o começo, lá pro início',
                    value: 'back'
                }
            ]
        }]
    }

    if (client.staff.includes(interaction.user.id))
        components.components[0].options.unshift(
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
        )

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: `${e.QuizLogo} ${client.user.username}'s Quiz Manager Request`,
            description: "📨 Criar categorais e enviar perguntas.\n🧐 Solicitar alterações e correções.\n🤐 Denúnciar alguma pergunta anonimamente.\n😙 Tudo é possível por aqui, quem faz o Quiz é você."
        }],
        components: [components]
    })
}