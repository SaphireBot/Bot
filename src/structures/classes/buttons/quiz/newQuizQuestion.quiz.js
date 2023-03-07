import { ButtonStyle } from "discord.js";
import Quiz from "../../../../classes/games/Quiz.js";
import { Database, SaphireClient as client } from "../../../../classes/index.js";
import { CodeGenerator } from "../../../../functions/plugins/plugins.js";
import { Emojis as e } from "../../../../util/util.js";

// Modal Interaction
export default async interaction => {

    const { fields, user, guild, customId, channel } = interaction
    const customIdData = JSON.parse(customId)
    const category = customIdData?.category

    if (!category)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível obter a categoria selecionada. Por favor, tente novamente.`,
            ephemeral: true
        })

    const question = fields.getTextInputValue('question')
    const correctAnwers = fields.getTextInputValue('correctQuestion')
    const wrong1 = fields.getTextInputValue('wrong1')
    const wrong2 = fields.getTextInputValue('wrong2')
    const wrong3 = fields.getTextInputValue('wrong3')

    if (Quiz.questions.find(doc => doc.question?.toLowerCase() == question.toLowerCase()))
        return await interaction.reply({
            content: `${e.DenyX} | Esta pergunta já existe no banco de dados.`,
            ephemeral: true
        })

    const answers = [
        {
            answer: correctAnwers,
            correct: true
        },
        {
            answer: wrong1,
            correct: false
        },
        {
            answer: wrong2,
            correct: false
        },
        {
            answer: wrong3,
            correct: false
        }
    ]

    for (let q of answers)
        if (answers.filter(ques => ques.answer == q.answer).length > 1)
            return await interaction.reply({
                content: `${e.DenyX} | Opa! Você não pode colocar respostas repetidas, ok?`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'Ok, tentar novamente',
                        custom_id: JSON.stringify({ c: 'quiz', src: category }),
                        style: ButtonStyle.Success
                    }]
                }]
            })

    const webhookUrl = await Quiz.getWebhookUrl(channel)

    const dataSave = {
        questionId: CodeGenerator(7),
        question, category, answers, webhookUrl,
        suggestedBy: user.id,
        hits: 0, misses: 0,
        guildId: guild.id, curiosity: []
    }

    Quiz.QuestionsIndications.push(dataSave)

    const embed = {
        color: client.blue,
        description: `${e.Loading} Aguardando envio...`,
        title: `${e.QuizLogo} ${client.user.username}'s Quiz Question Manager`,
        fields: [
            {
                name: '📝 Pergunta Solicitada',
                value: question
            },
            {
                name: '🏷️ Categoria Selecionada',
                value: category
            },
            {
                name: '✏️ Respostas',
                value: answers.map((wrong) => `${wrong.correct ? e.CheckV : e.DenyX} ${wrong.answer}`).join('\n')
            },
            {
                name: '🔎 Curiosidades',
                value: 'Nenhuma curiosidade informada'
            },
            {
                name: '🚩 Localidade',
                value: `👤 **${user.tag}** \`${user.id}\`\n🏠 **${guild.name}** \`${guild.id}\``
            },
            {
                name: '🛰️ Global System Notification - GSN',
                value: webhookUrl ? 'Ativado' : 'Desativado'
            }
        ],
        footer: {
            text: `Question ID: ${dataSave.questionId}`
        }
    }

    const components = [{
        type: 1,
        components: [
            {
                type: 2,
                label: 'Adicionar Curiosidade (3)',
                emoji: e.saphireLendo,
                custom_id: JSON.stringify({ c: 'quiz', src: 'addCuriosity', id: dataSave.questionId, userId: interaction.user.id }),
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Enviar Pergunta',
                emoji: '📨',
                custom_id: JSON.stringify({ c: 'quiz', src: 'saveQuestion', id: dataSave.questionId }),
                style: ButtonStyle.Success
            },
            {
                type: 2,
                label: 'Cancelar',
                emoji: e.Trash,
                custom_id: JSON.stringify({ c: 'delete', userId: interaction.user.id }),
                style: ButtonStyle.Danger
            }
        ]
    }]

    return await interaction.reply({ embeds: [embed], components })

}