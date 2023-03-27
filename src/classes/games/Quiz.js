import { Database, SaphireClient as client } from "../index.js";
import { ButtonStyle } from "discord.js";
import { Emojis as e } from "../../util/util.js";
import { setTimeout as sleep } from 'node:timers/promises'
import custom from "../../structures/classes/buttons/quiz/custom.quiz.js";
import QuizManager from "./QuizManager.js";
import keyboardQuizGame from "./quiz/keyboard.quizGame.js";
import buttons from "./quiz/buttons.quizGame.js";

export default class Quiz {
    constructor(interaction) {
        this.interaction = interaction
        this.message = interaction.message
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.data = { rounds: 0, hits: 0, misses: 0, timeBonus: 0, points: {}, anwersCounter: 0 }
        this.options = {}
        this.stop = false
        this.questions = QuizManager.questions
        this.defaultOptions = {
            userId: client.user.id, // UserId Preference --- It's client's ID 'cause is the default options
            gameType: 'keyboard', // keyboard | buttons
            responseTime: 15000, // 5000 ~ 60000
            gameRepeat: 'noRepeat', // endQuestion | allRepeat | noRepeat
            losePointAtError: false, // Boolean - At Game Button Type
            shortRanking: true, // Boolean - At both Game Type
            categories: QuizManager.categories // It's a [string, string] with all categories enabled
        }
    }

    setPreference(preferenceType) {

        const isDefault = preferenceType == 'default'
        const allCustomOptions = QuizManager.usersOptions || []
        const userOptions = isDefault ? undefined : allCustomOptions.find(op => op.userId == this.user.id)

        if (userOptions) {
            userOptions.losePointAtError = userOptions.losePointAtError == 'true'
            userOptions.shortRanking = userOptions.shortRanking == 'true'
            userOptions.categories = userOptions.categories.length > 0 ? userOptions.categories : QuizManager.categories
        }

        this.options = userOptions ?? this.defaultOptions
        this.options.categories = this.options.categories.length > 0 ? this.options.categories : QuizManager.categories
        this.shuffleQuestions()

        return;
    }

    async askPreference() {
        const hasPreference = QuizManager.usersOptions.some(op => op.userId == this.user.id)

        const content = {
            'true': `${e.Loading} Você já tem uma preferência salva, deseja jogar com ela?`,
            'false': `${e.Loading} Sabia que você pode personalizar o Quiz do seu jeito?`
        }[hasPreference]

        return await this.interaction.update({
            fetchReply: true,
            embeds: [{
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz Questions Game`,
                description: `${e.CheckV} Tudo certo para iniciar o jogo.\n${content}\n⏱️ Tempo restante para escolha: ${Date.Timestamp(21000, 'R')}`
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Voltar',
                        emoji: '⬅️',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'back', userId: this.user.id }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Preferência Padrão',
                        emoji: '📝',
                        custom_id: 'default',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Minha Preferência',
                        emoji: hasPreference ? '⭐' : e.GrayStar,
                        custom_id: 'custom',
                        style: ButtonStyle.Primary,
                        disabled: !hasPreference
                    },
                    {
                        type: 2,
                        label: 'Personalizar',
                        emoji: '🖌️',
                        custom_id: 'personalize',
                        style: ButtonStyle.Primary
                    },
                ]
            }]
        })
            .then(message => this.askPreferenceCollector(message))
            .catch(async err => {
                this.unregister()
                return await this.updateMessage({
                    content: `${e.DenyX} | Não foi possível solicitar a inicialização do Quiz.\n${e.bug} | \`${err}\``,
                    embeds: [],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: 'Voltar',
                                    emoji: '⬅️',
                                    custom_id: JSON.stringify({ c: 'quiz', src: 'back', userId: this.user.id }),
                                    style: ButtonStyle.Primary
                                }
                            ]
                        }
                    ]
                })
            })
    }

    async askPreferenceCollector(message) {

        this.message = message
        const userId = this.user.id

        return message.createMessageComponentCollector({
            filter: int => int.user.id === userId,
            time: 21000, max: 1, errors: ['time', 'max']
        })
            .on('collect', async int => {

                const { customId } = int
                if (['custom', 'default'].includes(customId)) return this.loadingPreferencesMessage(int, customId)
                this.unregister()
                if (customId.startsWith('{')) return
                if (customId == 'personalize') return custom(int)
            })
            .on('end', async (_, reason) => {

                if (reason == 'limit') return

                if (reason == 'messageDelete') {
                    this.unregister()
                    return this.channel.send({
                        content: `${e.SaphireWhat} | A mensagem para escolher o tipo do jogo do Quiz **SUMIU**, pra onde foi?`
                    }).catch(() => { })
                }

                if (reason == 'time') {
                    this.unregister()
                    const embed = message.embeds[0]?.data || []

                    if (embed) {
                        embed.description = `${e.DenyX} Tempo de resposta excedido.`
                        embed.color = client.red
                    }

                    return await this.updateMessage({
                        embeds: [embed],
                        components: [{
                            type: 1,
                            components: [{
                                type: 2,
                                label: 'Voltar',
                                emoji: '⬅️',
                                custom_id: JSON.stringify({ c: 'quiz', src: 'back', userId: userId }),
                                style: ButtonStyle.Primary
                            }]
                        }]
                    })
                }

                return
            })

    }

    async loadingPreferencesMessage(int, preferenceType) {

        const preferenceText = {
            default: 'as preferências padrões',
            custom: 'as suas preferências'
        }[preferenceType]

        await int.update({
            content: `${e.Loading} | Carregando ${preferenceText} e juntando as perguntas espalhadas por todo o Discord...`,
            embeds: [], components: []
        }).catch(err => {
            this.stop = true
            this.unregister()
            return this.channel.send({
                content: `${e.cry} | Quaaal éh!! Deu algum erro mistíco aqui... O Quiz de Perguntas foi canceladinho.\n${e.bug} | \`${err}\``
            }).catch(() => { })
        })

        if (this.stop) return this.unregister()

        const collector = this.message.createMessageComponentCollector({ filter: () => false, time: 3100 })
            .on('end', (_, reason) => {
                if (reason !== 'messageDelete') return
                this.stop = true
                this.unregister()
                return this.channel.send({
                    content: `${e.cry} | Quaaal éh!! Sabe que não pode apagar uma mensagem que está carregando, não sabe? O Quiz de Perguntas foi canceladinho.`
                }).catch(() => { })
            })

        this.setPreference(preferenceType)
        await sleep(2500)
        collector.stop()
        if (!this.stop) return this.prepare(int)
    }

    async prepare(int) {
        if (this.stop) return this.unregister()

        if (!this.questions?.length) {
            this.unregister()
            return await this.updateMessage({
                content: `${e.DenyX} | Por alguma razão neste universo, um total de 0 perguntas foram carregadas, acredita?`
            }).catch(() => { })
        }

        const optionsPreferenceUserId = this.options.userId

        const userPreference = optionsPreferenceUserId == client.user.id
            ? 'padrão'
            : await getUser()

        await this.updateMessage({
            content: `${e.CheckV} | Preferências e perguntas carregadas. PREPARE-SE!\n${e.Loading} | Embaralhando um total de **${this.questions?.length} perguntas** em **${this.options.categories.length} categorias** seguindo a **preferência ${userPreference}**.`,
            fetchReply: true
        })
            .then(async () => {
                await this.randomizeQuestion()
                const question = this.getQuestion()

                if (!question) {
                    this.stop = true
                    this.unregister()
                    return this.channel.send({
                        content: `${e.DenyX} | Ok ok ok ok ok!!!!! **NENHUMA** pergunta foi encontrada...`
                    }).catch(() => { })
                }

                return await this.lauch(this.options.gameType, question)
            })
            .catch(err => {
                this.stop = true
                this.unregister()
                return this.channel.send({
                    content: `${e.cry} | Não foi possível mandar a mensageeeem.\n${e.bug} | \`${err}\``
                }).catch(() => { })
            })

        async function getUser() {
            const fetchUser = await int.guild.members.fetch(optionsPreferenceUserId || '0').then(member => member.user).catch(() => null)
            if (fetchUser) return `de ${fetchUser?.tag || 'Not Found'}`
            return 'O ser humano não foi achado'
        }
    }

    async randomizeQuestion() {
        if (this.stop) return this.unregister()
        this.questions.sort(() => Math.random() - Math.random())
        await sleep(4000)
        return
    }

    async lauch(gameType, question) {
        const execute = {
            keyboard: keyboardQuizGame,
            buttons: buttons
        }[gameType]

        if (execute) await execute(question, this)
    }

    getQuestion() {
        const index = Math.floor(Math.random() * this.questions.length)
        const question = this.questions[index]
        if (this.options.gameRepeat != 'allRepeat') this.questions.splice(index, 1)
        return question
    }

    shuffleQuestions() {
        this.questions = this.options.userId !== client.user.id
            ? QuizManager.questions.filter(question => this.options.categories.includes(question?.category)) || []
            : QuizManager.questions
    }

    unregister() {
        return QuizManager.unregisterChannel(this.channel.id)
    }

    async deleteMessage() {
        return await this.message.delete().catch(() => { })
    }

    async channelSend({ content = null, embeds = [], components = [], redefineMessage = false }) {

        if (redefineMessage) {
            this.message = await this.channel.send({ content, embeds, components }).catch(() => { })
            return
        }

        return await this.channel.send({ content, embeds, components }).catch(() => { })
    }

    async updateMessage({ content = null, embeds = [], components = [], fetchReply = false }) {

        return await this.message?.edit({ content, embeds, components, fetchReply })
            .then(message => this.message = message)
            .catch(err => {
                this.stop = true
                this.unregister()
                this.channelSend({ content: `${e.DenyX} | Não foi possível editar a mensagem do Quiz...\n${e.bug} | \`${err}\`` })
            })
    }

    async addHitsAndMisses(questionId, hitsAmount, missesAmount) {
        await Database.Quiz.updateOne(
            { questionId },
            { $inc: { hits: hitsAmount, misses: missesAmount } }
        )
        const index = QuizManager.questions.findIndex(q => q.questionId == questionId)
        if (index >= 0) {
            QuizManager.questions[index].hits += hitsAmount
            QuizManager.questions[index].misses += missesAmount
        }
        return
    }

    calculateTime(correctQuestionAnswer) {
        if (!correctQuestionAnswer) return
        const words = correctQuestionAnswer.split(" ").length
        if (words > 1)
            for (let i = 0; i < words; i++)
                this.data.timeBonus += 500
        return
    }

    async finalize() {
        QuizManager.unregisterChannel(this.channel.id)
        const { hits, misses, points, rounds } = this.data

        const ranking = Object.entries(points)
            .sort((a, b) => b[0] - a[0])
            .map(([userId, point], i) => `${top(i)} <@${userId}> ${point} pontos`)
            .slice(0, 50)
            .join('\n')

        const embeds = [{
            color: client.blue,
            title: `🔎 ${client.user.username}'s Quiz | RESULTADO`,
            description: `Essa partida contou com **${rounds} rounds**.\nTambém teve **${hits} acertos** e **${misses} erros**.Também teve um total de **${this.data.anwersCounter} mensagens** analisadas.`
        }]

        if (ranking.length)
            embeds.push({
                color: client.blue,
                title: '🏆 Ranking da Partida',
                description: ranking,
                footer: {
                    text: 'Top 50 Players'
                }
            })

        return this.channelSend({ embeds })

        function top(i) {
            return {
                0: e.CoroaDourada,
                1: e.CoroaDePrata,
                2: e.thirdcrown
            }[i] || `${i + 1}.`
        }
    }

    async addUsersPoint(usersId = []) {
        if (typeof usersId == 'string') usersId = [usersId]
        await Database.User.updateMany({ id: { $in: usersId } }, { $inc: { "GamingCount.QuizQuestions": 1 } }, { upsert: true })
    }

    async next() {
        if (this.stop) return this.unregister()
        const question = this.getQuestion()

        if (!question) {
            this.stop = true
            this.unregister()
            return this.channelSend({ content: `${e.SaphireDesespero} | Ok ok ok ok ok!!!!! **NENHUMA** pergunta foi encontrada...\n${e.cry} | O jogo foi encerrado mas todos os pontos foram salvos.` })
        }

        await sleep(3000)
        return await this.lauch(this.options.gameType, question)
    }
}