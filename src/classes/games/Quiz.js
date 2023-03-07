import axios from "axios"
import { bindFunctions } from "../../util/Bind.js"
import { Config, DiscordPermissons } from "../../util/Constants.js"
import { Emojis as e } from "../../util/util.js"
import { SaphireClient as client, Database, Modals } from "../index.js"

export default new class QuizManager {
    constructor() {
        bindFunctions(this)
        /**
         * @returns Todas as indicações de categorias atuais
         */
        this.CategoriesIndications = []
        /**
         * @returns Todas as indicações perguntas atuais
         */
        this.QuestionsIndications = []
        /**
         * @returns Todas as categorias válidas
         */
        this.categories = []
        /**
         * @returns Todas as perguntas do quiz
         */
        this.questions = []
        /**
         * @returns Todos os reportes efetuados
         */
        this.reports = []
        /**
         * @returns Todas os jogos ativos
         */
        this.games = []
        /**
         * @returns Todas os ID de canais em jogo
         */
        this.channelsInGames = []
    }

    async load() {
        const clientData = await Database.Client.findOne({ id: client.user.id })
        this.CategoriesIndications = clientData?.QuizCategoryIndications || []
        this.QuestionsIndications = clientData?.QuizQuestionsIndications || []
        this.reports = clientData?.QuizQuestionsReports || []
        const documents = await Database.Quiz.find({})
        this.categories.push(...documents.find(doc => doc.category == "SaveCategories")?.enableCategories)
        documents.splice(documents.findIndex(doc => doc.category == "SaveCategories"), 1)
        this.questions.push(...documents)
        return
    }

    // Button/SelectMenu Interaction
    async newQuestion(interaction, src) {
        return await interaction.showModal(Modals.newQuizQuestion(src)).catch(() => { })
    }

    // Button/SelectMenu Interaction
    async newCategory(interaction) {
        return await interaction.showModal(Modals.newQuizCategory)
    }

    async createWebhook(channel) {
        if (!channel) return null
        return await channel.createWebhook({
            name: "Saphire Global System Notification",
            avatar: "./src/images/webhooks/anime_reporter.png",
            reason: "Sistema automático de feedback"
        })
            .then(webhook => webhook.url)
            .catch(() => null)
    }

    async getWebhookUrl(channel) {
        if (!channel) return null
        if (!channel.guild.members.me.permissions.has(DiscordPermissons.ManageWebhooks, true)) return null

        const webhooks = await channel.fetchWebhooks().catch(() => null)

        if (webhooks && webhooks.size) {
            const saphireWebhook = webhooks.find(wb => wb.owner.id == client.user.id)
            if (saphireWebhook) return saphireWebhook.url
            else return await this.createWebhook(channel)
        } else return await this.createWebhook(channel)
    }

    // Button Interaction
    async deleteQuestion(questionId) {

        this.questions.splice(
            this.questions.findIndex(q => q.questionId == questionId), 1
        )

        this.QuestionsIndications.splice(
            this.QuestionsIndications.findIndex(q => q.questionId == questionId), 1
        )

        return await Database.Quiz.deleteOne({ questionId })
            .then(() => true)
            .catch(() => false)
    }

    // Button/SelectMenu Interaction
    async newReport(interaction) {

        const { customId } = interaction
        const customIdData = JSON.parse(customId)
        const question = this.questions.find(q => q.questionId == customIdData.id)

        if (!question)
            return await interaction.update({
                content: `${e.Deny} | Pergunta não encontrada.`,
                embeds: [], components: []
            }).catch(() => { })

        return await interaction.showModal(Modals.newQuizReport(question.questionId))
    }

    // Button Interaction
    async defineRefuseReason(interaction) {
        const customIdData = JSON.parse(interaction.customId)
        const questionId = customIdData.id
        return await interaction.showModal(Modals.RefuseReason(questionId))
    }

    // Button Interaction
    async showModalFeedback(interaction) {
        if (!client.staff.includes(interaction.user.id))
            return await interaction.reply({
                content: `${e.DenyX} | Epa epa, apenas os meus moderadores podem concluir os reportes, beleza?`,
                ephemeral: true
            })

        const customIdData = JSON.parse(interaction.customId)
        const questionId = customIdData.id
        return interaction.showModal(Modals.feedbackModal(questionId))
    }

    async removeReport(reportId) {
        this.reports.splice(
            this.reports.findIndex(r => r.reportId == reportId), 1
        )
        await Database.Client.updateOne(
            { id: client.user.id },
            { $pull: { QuizQuestionsReports: { reportId } } }
        )
        return
    }

    // Button Interaction
    async addCuriosity(interaction) {
        const customId = JSON.parse(interaction.customId)

        if (![customId.userId, ...client.staff].includes(interaction.user.id))
            return await interaction.reply({
                content: `${e.DenyX} | Calminha coisa fofa, só os moderadores e o criador da pergunta pode adicionar curiosidades nessa fase de criação, ok?`,
                ephemeral: true
            })

        const question = this.QuestionsIndications.find(q => q?.questionId == customId.id)

        if (!question)
            return await interaction.update({
                content: `${e.Deny} | Nenhuma pergunta foi encontrada para adição de curiosidade.`,
                embeds: [], components: []
            }).catch(() => { })

        return await interaction.showModal(Modals.addCuriosity(question))
    }

    async sendDocument(attachment) {
        if (!Config.webhookQuizReporter) return
        return await Config.webhookQuizReporter.send({ files: [attachment] }).catch(() => { })
    }
}