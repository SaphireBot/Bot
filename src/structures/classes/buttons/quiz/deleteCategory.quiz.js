import QuizManager from "../../../../classes/games/QuizManager.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.Deny} | Wow wow wow, calminha aí. Só um dos meus moderadores pode entrar aqui, beleza?`,
            ephemeral: true
        })

    const category = interaction.message?.embeds[0]?.data?.footer?.text
    const questions = QuizManager.questions.filter(q => q?.category == category) || []

    return await interaction.update({
        embeds: [{
            color: 0x773003,
            title: `${e.QuizLogo} ${client.user.username}'s Categories Review`,
            description: `Ao deletar a categoria **${category}**, um total de **${questions.length} perguntas** serão deletadas.`,
            footer: { text: category }
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Voltar',
                        emoji: '⬅️',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'viewCategories', userId: interaction.user.id }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Deletar',
                        emoji: e.Trash,
                        custom_id: JSON.stringify({ c: 'quiz', src: 'delCatAndQuestions' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

}