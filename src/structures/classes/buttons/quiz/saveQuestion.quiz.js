import Quiz from "../../../../classes/games/QuizManager.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { readFileSync, rm, writeFileSync } from 'fs'
import { Emojis as e } from "../../../../util/util.js"
import { AttachmentBuilder } from "discord.js"
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Button Interaction
export default async interaction => {

    const { message, customId, guild } = interaction
    const customData = JSON.parse(customId)
    const questionId = customData.id
    const indication = Quiz.QuestionsIndications.find(q => q.questionId == questionId)

    if (!indication)
        return await interaction.update({
            content: `${e.Deny} | Infelizmente essa indicação não foi encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    const embed = message.embeds[0]?.data

    if (!embed)
        return await interaction.update({ content: `${e.Deny} | A embed sumiu que nem mágica... Que isso?`, components: [] }).catch(() => { })

    return await Database.Client.updateOne(
        { id: client.user.id },
        { $push: { QuizQuestionsIndications: { $each: [indication] } } }
    )
        .then(() => updateSaveAndSendData())
        .catch(err => updateSaveAndSendData(err))

    async function updateSaveAndSendData(err) {

        if (err)
            return await interaction.update({ content: `${e.DenyX} | Não foi possível concluir a indicação.\n${e.bug} | \`${err}\``, embeds: [], components: [] }).catch(() => { })

        await interaction.update({ content: `${e.Loading} | Um segundo, sua indicação já foi salva. Estou autenticando alguns dados...`, embeds: [], components: [] }).catch(() => { })

        writeFileSync(
            `${questionId}.txt`,
            `--- SOLICITAÇÃO DE PERGUNTA | QUIZ QUESTION SYSTEM | FILE SECURITY REVIEW ---

Status: ENVIADO PARA ANÁLISE
Categoria Solicitada: ${indication.category}
Pergunta Solicitada: ${indication.question}
Respostas Selecionadas: \n${indication.answers.map(answer => `${answer.correct ? 'CORRETA' : 'ERRADA'} - ${answer.answer}`).join('\n')}
Curiosidades Adicionadas: ${indication.curiosity.length ? indication.curiosity.map((cur, i) => `\n${i + 1} - ${cur}`).join('') : 'Nenhuma'}
Solicitante: ${interaction.user.tag} - ${interaction.user.id}
Servidor de Origem: ${guild.name} - ${guild.id}
Global System Notification: ${indication.webhookUrl ? 'Ativado' : 'Desativado'}
Personal Question ID: ${questionId}

Você está sujeito a punições dentro dos sistemas da Saphire BOT em quebra de regras morais/éticas.
            `,
            { encoding: 'utf8' }
        )

        await delay(2000)

        try {
            const buffer = readFileSync(`${questionId}.txt`)
            const attachment = new AttachmentBuilder(buffer, { name: `${questionId}.txt`, description: 'Solicitação de Nova Pergunta para o Quiz' })
            await Quiz.sendDocument(attachment).catch(() => { })
            rm(`${questionId}.txt`, err => {
                if (err)
                    return console.log(`Não foi possível deletar a suagestão de perguntas no Quiz: ${questionId}.txt`)
            })

            await interaction.message.edit({
                content: `${e.Check} | A sua solicitação foi enviada com sucesso.\n${e.Info} | Sua indicação está na posição **${Quiz.QuestionsIndications.length}°** na fila de espera.`,
                embeds: [],
                components: [],
                files: [attachment]
            }).catch(() => { })
            return
        } catch (err) {
            return await interaction.message.edit({
                content: `${e.Info} | Tive um pequeno problema na autenticação de dados. Porém, sua indicação foi salva. Ela está na posição **${Quiz.QuestionsIndications.length}°** na fila de espera.\n${e.bug} | \`${err}\``,
                embeds: [],
                components: []
            }).catch(() => { })
        }

    }
}
