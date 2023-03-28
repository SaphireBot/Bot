import { ButtonStyle } from "discord.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import QuizManager from "../../../../classes/games/QuizManager.js"

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Hey, tudo bom aí? Esse parte aqui é só para os meus moderadores, beleza?`,
            ephemeral: true
        })

    const value = interaction.values[0]
    if (!value)
        return await interaction.reply({ content: `${e.Deny} | Não consegui encontrar o nome da categoria.`, ephemeral: true })

    const questions = QuizManager.questions.filter(q => q.category == value) || []
    const hits = questions.reduce((pre, acc) => pre += acc.hits, 0)
    const misses = questions.reduce((pre, acc) => pre += acc.misses, 0)

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: `${e.QuizLogo} ${client.user.username}'s Categories Review`,
            description: `A categoria **${value}** possui atualmente **${questions.length} perguntas**.\nTambém possui **${hits} acertos** com um total de **${misses} erros**.`,
            footer: { text: value }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Voltar',
                        emoji: '⬅️',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'viewCategories' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Editar Nome da Categoria',
                        emoji: '🖌️',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'changeCategoryName' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Deletar Categoria',
                        emoji: e.Trash,
                        custom_id: JSON.stringify({ c: 'quiz', src: 'deleteCategory' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    }).catch(() => { })

}