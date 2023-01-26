import { ButtonStyle, time } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../../classes/index.js"
import { emoji } from "../../../../../../functions/plugins/plugins.js"
import { DiscordPermissons } from "../../../../../../util/Constants.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default class AnimeQuizManager {
    constructor(interaction) {
        this.interaction = interaction
        this.user = interaction.user
        this.options = interaction.options
        this.channel = interaction.channel
        this.type = interaction.options.getString('category')
        this.typeName = [
            {
                name: 'Quiz de Animes',
                value: 'anime'
            },
            {
                name: 'Quiz de Personagens Masculinos',
                value: 'male'
            },
            {
                name: 'Quiz de Personagens Femininos',
                value: 'female'
            },
            {
                name: 'Quiz de Personagens Outros (Pets, dragões, robos, etc...)',
                value: 'others'
            },
            {
                name: 'Hiper Mix - Tudo Misturado',
                value: 'all'
            }
        ]
        this.allSuggests = [...client.animes]
        this.commandSuggestMention = `</quiz anime suggest:${interaction.commandId}>`
        this.message = undefined
        this.availableSuggests = []
        this.points = {}
        this.gameData = {}
    }

    async analize() {

        if (this.type === 'liberate') {
            if (!this.interaction.member.permissions.has(DiscordPermissons.Administrator))
                return await this.interaction.reply({
                    content: `${e.Deny} | Apenas um administrador por liberar este canal.`,
                    ephemeral: true
                })

            if (!client.chatsInGame.includes(this.channel.id))
                return await this.interaction.reply({
                    content: `${e.Check} | Hey! O canal já está liberado, beleza?`
                })

            this.unregister()
            return await this.interaction.reply({
                content: `${e.Check} | O canal foi liberado.`
            })
        }

        if (!this.allSuggests.length)
            return await this.interaction.reply({
                content: `${e.Deny} | As sugestões desse jogo não foram carregadas ainda. Por favor, espere 1 minuto e tente novamente.`,
                ephemeral: true
            })

        this.availableSuggests = this.type == 'all' ? this.allSuggests : this.allSuggests.filter(an => an.type == this.type)

        const typeName = this.typeName.find(ty => ty.value == this.type).name

        if (!this.availableSuggests.length)
            return await this.interaction.reply({
                content: `${e.Deny} | As opções do quiz na categoria \`${typeName}\` não tem nenhuma opção... Você pode mandar uma, o que acha? ${this.commandSuggestMention}`,
                ephemeral: true
            })

        if (this.availableSuggests.length < 4)
            return await this.interaction.reply({
                content: `${e.Deny} | A categoria \`${typeName}\` possui **${this.availableSuggests.length}/4** sugestões. O requisito mínimo é de 4 sugestões para iniciar uma partida pequena. Você pode mandar uma sugestão, sabia? ${this.commandSuggestMention}`,
                ephemeral: true
            })

        client.chatsInGame.push(this.channel.id)

        this.message = await this.interaction.reply({
            content: `${e.QuestionMark} | A categoria \`${typeName}\` tem exatamente **${this.availableSuggests.length} opções** disponíveis para o jogo atual, deseja iniciar?`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Sim, iniciar!',
                            emoji: e.waku,
                            custom_id: 'init',
                            style: ButtonStyle.Success
                        },
                        {
                            type: 2,
                            label: 'Não, cancelar!',
                            emoji: e.Deny,
                            custom_id: JSON.stringify({ c: 'delete' }),
                            style: ButtonStyle.Danger
                        }
                    ]
                }
            ],
            fetchReply: true
        })

        const collector = this.message.createMessageComponentCollector({
            filter: int => int.user.id === this.user.id,
            time: 20000,
            max: 1,
            errors: ['idle', 'max']
        })
            .on('collect', async int => {

                if (int.customId == 'init') {
                    collector.stop()
                    return this.load()
                }

            })
            .on('end', async (_, reason) => {

                if (reason == 'user') return

                this.unregister()
                return this.message.edit({
                    content: `${e.Deny} | O joguinho do Quiz Anime foi cancelado`,
                    components: []
                }).catch(() => this.unregister())
            })
        return
    }

    async unregister() {
        client.chatsInGame.splice(
            client.chatsInGame.findIndex(id => id == this.channel.id),
            1
        )
        return;
    }

    async load(isNext) {

        if (!isNext) {
            this.message.edit({ content: `${e.waku} | Ok ok... Let's Goo!`, components: [] }).catch(() => this.unregister())
            const typeName = this.typeName.find(ty => ty.value == this.type).name
            this.message = await this.channel.send({
                content: `${e.Loading} | Carregando sugestões e montando um novo jogo...\n${e.CheckV} | Categoria Selecionada: **${typeName}**`,
                fetchReply: true
            })
        }

        const index = [Math.floor(Math.random() * this.availableSuggests.length)]
        const firstAlternative = this.availableSuggests[index]
        this.availableSuggests.splice(index, 1)
        const buttons = this.generateButtons(firstAlternative)
        if (!buttons) return this.message.delete().catch(() => this.unregister())

        return setTimeout(() => this.loadMessage(firstAlternative, buttons, isNext), 1700)
    }

    async loadMessage(alternative, buttons, isNext) {

        if (!isNext)
            this.message.delete().catch(() => this.unregister())

        const descriptionComplement = {
            anime: 'deste anime',
            female: 'desta personagem',
            male: 'deste personagem',
            others: 'deste ser'
        }[alternative.type]

        const userSend = client.users.cache.get(alternative.sendedFor || '0')

        const element = [
            {
                name: 'Anime',
                value: 'anime'
            },
            {
                name: 'Personagem Masculino',
                value: 'male'
            },
            {
                name: 'Personagem Feminino',
                value: 'female'
            },
            {
                name: 'Outros (Pet, dragão, robo, etc...)',
                value: 'others'
            }
        ].find(ty => ty.value == alternative.type).name

        const fields = [{
            name: '📝 Tipo do Elemento',
            value: `${element}`
        }]

        if (userSend)
            fields.push({
                name: '👤 Enviado por',
                value: `${userSend.tag} - \`${userSend.id}\``
            })

        const data = {
            content: null,
            embeds: [{
                color: client.blue,
                title: `${client.user.username}'s Anime Community Quiz`,
                description: `${e.Loading} Qual é o nome ${descriptionComplement}?\n⏱️ ${time(new Date(Date.now() + 20000), 'R')}`,
                fields,
                image: {
                    url: alternative.imageUrl
                },
                footer: {
                    text: `❤️ Powered By: ${client.user.username}'s Community`
                }
            }],
            components: [buttons]
        }

        isNext
            ? this.message.edit(data).catch(() => this.unregister())
            : this.message = await this.channel.send({ ...data, fetchReply: true })

        return this.loadCollector(alternative)
    }

    async loadCollector(alternative) {

        const errorsAlternatives = []

        const collector = this.message.createMessageComponentCollector({
            filter: () => true,
            time: 20000,
            errors: ['time']
        })
            .on('collect', async int => {

                const { customId, user } = int

                if (errorsAlternatives.includes(user.id)) {
                    return int.reply({ content: `${e.Deny} | Você já errou está rodada, espere a próxima, ok?`, ephemeral: true })
                }

                if (customId !== alternative.id) {
                    errorsAlternatives.push(user.id)
                    return int.reply({ content: `${e.Deny} | Você errou está rodada.`, ephemeral: true })
                }

                collector.stop()
                this.points[user.id] ? this.points[user.id]++ : this.points[user.id] = 1
                this.savePoint(user.id)
                return this.accept(alternative, user)
            })
            .on('end', async (_, reason) => {

                if (!['time', 'messageDelete', 'channelDelete'].includes(reason)) return
                await this.unregister()

                if (['channelDelete', 'messageDelete'].includes(reason))
                    return this.channel.send({
                        content: `${e.SaphireDesespero} | Apagaram a mensaaaaagem. Jogo cancelado só de raiva.`
                    }).catch(() => { })

                const embed = this.message?.embeds[0]?.data

                if (!embed) {
                    this.message.delete().catch(() => this.unregister())
                    return this.channel.send({
                        content: `${e.Deny} | Tiraram a embed da mensagem! Eu encerrei esse jogo por aqui.`
                    })
                }

                embed.color = client.red
                embed.fields.unshift({
                    name: '⭐ Nome',
                    value: `**${alternative.name.captalize()}**${alternative.type === 'anime' ? '' : `\n**${alternative.anime.captalize()}**`}`
                })
                embed.description = `Ninguém acertou esta alternativa.`

                const ranking = Object
                    .entries(this.points || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([id, points], i) => `${emoji(i)} <@${id}> ${points} acertos`)

                let aditional = ''
                if (ranking > 5) aditional = `\n+${ranking.length - 5} jogadores`

                embed.fields.push({
                    name: '🏆 Top Players',
                    value: `${ranking.slice(0, 5).join('\n')}${aditional}`
                })

                return await this.message.edit({ embeds: [embed], components: [] }).catch(() => this.unregister())

            })

        return
    }

    async accept(alternative, user) {

        const embed = this.message?.embeds[0]?.data

        if (!embed) {
            this.message.delete().catch(() => this.unregister())
            return this.channel.send({
                content: `${e.Deny} | Tiraram a embed da mensagem! Eu encerrei esse jogo por aqui.`
            })
        }

        embed.color = client.green
        embed.fields.unshift({
            name: '⭐ Nome',
            value: `**${alternative.name.captalize()}**${alternative.type === 'anime' ? '' : `\n**${alternative.anime.captalize()}**`}`
        })
        embed.description = `${user} acertou esta alternativa.`

        const ranking = Object
            .entries(this.points || {})
            .sort((a, b) => b[1] - a[1])
            .map(([id, points], i) => `${emoji(i)} <@${id}> ${points} acertos`)

        let aditional = ''
        if (ranking > 5) aditional = `\n+${ranking.length - 5} jogadores`

        embed.fields.push({
            name: '🏆 Top Players',
            value: `${ranking.slice(0, 5).join('\n')}${aditional}`
        })

        if (!this.availableSuggests.length) {
            this.unregister()
            await this.channel.send({
                content: `${e.cry} | Todas as alternativas para este modo acabou.\n${e.waku} | Mas você sabia que você pode enviar mais, né? Clica nesse comando aqui: ${this.commandSuggestMention}`
            })
        }

        this.message.edit({ embeds: [embed], components: [] }).catch(() => this.unregister())
        this.message = await this.message.channel.send({
            content: `${e.Loading} | Carregando próxima partida...`,
            fetchReply: true
        })
        this.load(true)
    }

    generateButtons(alternative) {

        if (!alternative) return null
        const allAlternativeFromSameType = this.allSuggests.filter(an => an.type == alternative.type)?.random(4)

        if (!allAlternativeFromSameType.length || allAlternativeFromSameType.length < 4) {
            this.unregister()

            const type = [
                {
                    name: 'Animes',
                    value: 'anime'
                },
                {
                    name: 'Personagens Masculinos',
                    value: 'male'
                },
                {
                    name: 'Personagens Femininos',
                    value: 'female'
                },
                {
                    name: 'Outros (Pets, dragões, robos, etc...)',
                    value: 'others'
                }
            ].find(an => an.value == alternative.type)?.name

            this.message.edit({
                content: `${e.Deny} | No banco de dados existem apenas **${allAlternativeFromSameType.length}/4** artenativas da categoria **${type}**. Por favor, indique uma usando o comando ${this.commandSuggestMention}`
            }).catch(() => this.unregister())
            return null
        }

        const has = allAlternativeFromSameType.some(an => an.id == alternative.id)
        if (!has) allAlternativeFromSameType[0] = alternative

        const buttonsComponents = allAlternativeFromSameType
            .sort(() => Math.random() - Math.random())
            .map(an => ({
                type: 2,
                label: an.name.captalize(),
                custom_id: an.id,
                style: ButtonStyle.Primary
            }))

        const availableButtons = []

        for (let button of buttonsComponents)
            if (availableButtons.some(bt => bt.custom_id == button.custom_id)) continue
            else availableButtons.push(button)

        return { type: 1, components: availableButtons }

    }

    async savePoint(userId) {
        await Database.User.updateOne(
            { id: userId },
            { $inc: { 'GamingCount.QuizAnime': 1 } },
            { upsert: true }
        )
    }
}