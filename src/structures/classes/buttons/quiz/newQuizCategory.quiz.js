import Quiz from "../../../../classes/games/QuizManager.js"
import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { readFileSync, rm, writeFileSync } from "fs"
import { Emojis as e } from "../../../../util/util.js"
import { AttachmentBuilder } from "discord.js"
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async interaction => {

    const { fields, user, guild, channel } = interaction
    const category = fields.getTextInputValue('category')
    const reason = fields.getTextInputValue('reason')
    const categories = Quiz.categories || []

    if (categories.find(cat => cat?.toLowerCase() == category?.toLowerCase()))
        return await interaction.reply({
            content: `${e.DenyX} | Esta categoria já existe no banco de dados.`,
            ephemeral: true
        })

    if (Quiz.CategoriesIndications.find(ind => ind?.category?.toLowerCase() == category.toLowerCase()))
        return await interaction.reply({
            content: `${e.DenyX} | Esta categoria já foi indicada por outra pessoa e está esperando pela análise.`,
            ephemeral: true
        })

    const webhookUrl = await Quiz.getWebhookUrl(channel)

    const dataSave = {
        userId: user.id,
        guildId: guild.id,
        channelId: channel.id,
        category, reason, webhookUrl
    }

    return await Database.Client.updateOne(
        { id: client.user.id },
        { $push: { QuizCategoryIndications: { $each: [dataSave] } } }
    )
        .then(async () => {
            Quiz.CategoriesIndications.push(dataSave)
            return await registerCategorySuggestion()
        })
        .catch(err => registerCategorySuggestion(err))

    async function registerCategorySuggestion(err) {

        if (err)
            return await interaction.update({ content: `${e.DenyX} | Não foi possível concluir a indicação.\n${e.bug} | \`${err}\``, embeds: [], components: [] }).catch(() => { })

        await interaction.update({ content: `${e.Loading} | Um segundo, sua indicação já foi salva. Estou autenticando alguns dados...`, embeds: [], components: [] }).catch(() => { })

        writeFileSync(
            `${user.id.slice(5)}-${user.id}.txt`,
            `--- SOLICITAÇÃO DE CATEGORIA | QUIZ QUESTION SYSTEM | FILE SECURITY REVIEW ---

Status: ENVIADO PARA ANÁLISE
Categoria Solicitada: ${dataSave.category}
Solicitante: ${user.tag} - ${user.id}
Servidor de Origem: ${guild.name} - ${guild.id}
Global System Notification: ${dataSave.webhookUrl ? 'Ativado' : 'Desativado'}

Você está sujeito a punições dentro dos sistemas da Saphire BOT em quebra de regras morais/éticas.
            `,
            { encoding: 'utf8' }
        )

        await delay(2000)

        try {
            const buffer = readFileSync(`${user.id.slice(5)}-${user.id}.txt`)
            const attachment = new AttachmentBuilder(buffer, { name: `${user.id}.txt`, description: 'Solicitação de Nova Pergunta para o Quiz' })
            await Quiz.sendDocument(attachment).catch(() => { })
            rm(`${user.id.slice(5)}-${user.id}.txt`, err => {
                if (err)
                    return console.log(`Não foi possível deletar a suagestão de perguntas no Quiz: ${user.id.slice(5)}-${user.id}.txt`)
            })

            await interaction.message.edit({
                content: `${e.Check} | A sua solicitação foi enviada com sucesso.\n${e.Info} | Sua indicação está na posição **${Quiz.CategoriesIndications.length}°** na fila de espera.`,
                embeds: [],
                components: [],
                files: [attachment]
            }).catch(() => { })
            return
        } catch (err) {
            return await interaction.message.edit({
                content: `${e.Info} | Tive um pequeno problema na autenticação de dados. Porém, sua indicação foi salva. Ela está na posição **${Quiz.CategoriesIndications.length}°** na fila de espera.\n${e.bug} | \`${err}\``,
                embeds: [],
                components: []
            }).catch(() => { })
        }
    }

}