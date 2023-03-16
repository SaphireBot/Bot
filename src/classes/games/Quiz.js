import QuizManager from "./QuizManager.js";
import custom from "../../structures/classes/buttons/quiz/custom.quiz.js";
import { SaphireClient as client } from "../index.js";
import { ButtonStyle } from "discord.js";
import { Emojis as e } from "../../util/util.js";
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export default class Quiz {
    constructor(interaction) {
        this.interaction = interaction
        this.message = interaction.message
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.data = {
            rounds: 0,
            hits: 0,
            misses: 0
        }
        this.options = {}
        this.stop = false
        this.questions = QuizManager.questions
        this.defaultOptions = {
            userId: client.user.id, // Users Preference --- It's client's 'cause is the default options
            gameType: 'keyboard', // keyboard | buttons
            responseTime: 15000, // 5000 ~ 60000
            gameRepeat: 'noRepeat', // repeat | endQuestion | allRepeat | noRepeat
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
        this.questions = userOptions
            ? QuizManager.questions.filter(question => this.options.categories.includes(question?.category)) || []
            : QuizManager.questions

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
                description: `${e.CheckV} Tudo certo para iniciar o jogo.\n${content}\n⏱️ Você tem esse tempo para escolher: ${Date.Timestamp(21000, 'R')}`
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
                return await this.message.edit({
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
                }).catch(() => { })
            })
    }

    async askPreferenceCollector(message) {

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

                    return await message.edit({
                        embeds: [embed],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: 'Voltar',
                                        emoji: '⬅️',
                                        custom_id: JSON.stringify({ c: 'quiz', src: 'back', userId: userId }),
                                        style: ButtonStyle.Primary
                                    }
                                ]
                            }
                        ]
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

        this.message = await int.update({
            content: `${e.Loading} | Carregando ${preferenceText} e juntando as perguntas espalhadas por todo o Discord...`,
            embeds: [], components: [], fetchReply: true
        }).catch(() => {
            this.stop = true
            this.unregister()
            return this.channel.send({
                content: `${e.cry} | Quaaal éh!! Sabe que não pode apagar uma mensagem que está carregando, não? O Quiz de Perguntas foi canceladinho.`
            }).catch(() => { })
        })

        if (this.stop) return

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
        await delay(3000)
        collector.stop()
        if (!this.stop) return this.prepare(int)
    }

    async prepare(int) {
        if (this.stop) return

        if (!this.questions?.length) {
            this.unregister()
            return await this.message.edit({
                content: `${e.DenyX} | Por alguma razão neste universo, um total de 0 perguntas foram carregadas, acredita?`
            }).catch(() => { })
        }

        const optionsPreferenceUserId = this.options.userId

        const userPreference = optionsPreferenceUserId == client.user.id
            ? 'padrão'
            : await getUser()

        await this.message.edit({
            content: `${e.CheckV} | Preferências e perguntas carregadas. PREPARE-SE!\n${e.Loading} | Embaralhando um total de **${this.questions?.length} perguntas** em **${this.options.categories.length} categorias** seguindo a **preferência ${userPreference}**.`
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
            .catch(() => {
                this.stop = true
                this.unregister()
                return this.channel.send({
                    content: `${e.cry} | A mensagem foi deletadaaaaa. O quiz também foi...`
                }).catch(() => { })
            })

        async function getUser() {
            const fetchUser = await int.guild.members.fetch(optionsPreferenceUserId || '0').then(member => member.user).catch(() => null)
            if (fetchUser) return `de ${fetchUser?.tag || 'Not Found'}`
            return 'O ser humano não foi achado'
        }
    }

    async randomizeQuestion() {
        if (this.stop) return
        this.questions.sort(() => Math.random() - Math.random())
        await delay(4000)
        return
    }

    async lauch(gameType, question) {
        if (this.stop) return
        this.data.rounds++
        const embed = {
            color: client.blue,
            title: `${e.QuizLogo} ${client.user.username}'s Quiz Game`,
            description: `${e.QuestionMark} **${question.question}**\n \n⏱️ ${Date.Timestamp(this.options.responseTime, 'R')}`,
        }

        await this.message.delete().catch(() => { })
        this.message = await this.message.channel.send({
            content: `⏱️ | ${Date.Timestamp(this.options.responseTime, 'R')}\n📝 | Categoria ${question.category}\n${e.QuestionMark} | **${question.question}**`, embeds: [],
            fetchReply: true
        })
    }

    getQuestion() {
        return this.questions[Math.floor(Math.random() * this.questions.length)]
    }

    unregister() {
        return QuizManager.unregisterChannel(this.channel.id)
    }
}