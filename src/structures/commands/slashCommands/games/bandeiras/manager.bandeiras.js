import { ButtonStyle, time } from "discord.js";
import { Database, SaphireClient as client } from "../../../../../classes/index.js";
import { emoji } from "../../../../../functions/plugins/plugins.js";
import { Emojis as e, Flags } from "../../../../../util/util.js";

export default class FlagGame {
    constructor(interaction) {
        this.interaction = interaction
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.gameData = {
            mode: undefined,
            style: undefined,
            started: false,
            flags: [],
            points: {},
            actualFlag: {},
            tries: 0,
            round: 0
        }
        this.message = undefined
        this.timer = 30000
    }

    async register() {
        if (client.chatsInGame.includes(this.channel.id))
            return await this.interaction.reply({
                content: `${e.Deny} | Este canal já está em uma partida de quiz. Por favor, espere a partida atual acabar ou recomece em outro canal.`,
                ephemeral: true
            })
        client.chatsInGame.push(this.channel.id)
        return this.choose()
    }

    async choose() {
        this.message = await this.interaction.reply({
            embeds: [{
                color: client.blue,
                title: `🗺️ ${client.user.username}'s Bandeiras Quiz`,
                description: `${e.Loading} Qual modo de jogo você quer jogar?`,
                fields: [
                    {
                        name: '👤 Solo',
                        value: 'Uma partida solitária. Jogue você contra você.'
                    },
                    {
                        name: `${e.amongusdance} Party`,
                        value: 'Jogue com todo mundo! Todos podem jogar aqui.'
                    }
                ]
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Solo',
                            emoji: '👤',
                            custom_id: 'solo',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Party',
                            emoji: e.amongusdance,
                            custom_id: 'party',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Cancelar',
                            emoji: '✖️',
                            custom_id: 'cancel',
                            style: ButtonStyle.Danger
                        }
                    ]
                }
            ],
            fetchReply: true
        })
        const collector = this.message.createMessageComponentCollector({
            filter: int => int.user.id === this.user.id,
            idle: 30000,
            max: 1,
            errors: ['idle']
        })
            .on('collect', async int => {
                const { customId } = int
                if (customId === 'cancel') return collector.stop()
                this.gameData.mode = customId
                this.gameData.started = true
                collector.stop()
                return this.chooseStyle(int)
            })
            .on('end', async () => {
                if (this.gameData.started) return
                this.unregister()
                return await this.interaction.editReply({ content: `${e.Deny} | Comando cancelado.`, embeds: [], components: [] }).catch(() => { })
            })
    }

    async chooseStyle(int) {

        this.message = await int.update({
            embeds: [{
                color: client.blue,
                title: `🗺️ ${client.user.username}'s Bandeiras Quiz`,
                description: `${e.Loading} Qual o estilo do jogo?`,
                fields: [
                    {
                        name: '👆 Com Botões',
                        value: 'Você não precisa escrever os nomes dos paises no chat, apenas clicar na opção correta.\n*obs: Você só tem uma chance.*'
                    },
                    {
                        name: '⌨️ Pelo Teclado',
                        value: 'Sem botões e sem ajuda! Aqui é você e seus dedos.\n*obs: Chances ilimitadas.*'
                    }
                ]
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Botões',
                            emoji: '👆',
                            custom_id: 'buttons',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Teclado',
                            emoji: '⌨️',
                            custom_id: 'keyboard',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Cancelar',
                            emoji: '✖️',
                            custom_id: 'cancel',
                            style: ButtonStyle.Danger
                        }
                    ]
                }
            ],
            fetchReply: true
        }).catch(() => this.unregister())

        this.gameData.started = false

        if (!this.message) {
            this.unregister()
            return await this.interaction.channel.send({
                content: `${e.SaphireChorando} | Não foi possível continuar com o quiz por razões desconhecidas do universo...`
            })
        }

        const collector = this.message.createMessageComponentCollector({
            filter: int => int.user.id === this.user.id,
            idle: 30000,
            errors: ['idle']
        })
            .on('collect', async int => {

                const { customId } = int
                if (customId === 'cancel') return collector.stop()
                this.gameData.style = customId
                this.gameData.started = true
                collector.stop()
                return this.loadMessage()
            })
            .on('end', async () => {
                if (this.gameData.started) return
                this.unregister()
                return await this.interaction.editReply({ content: `${e.Deny} | Comando cancelado.`, embeds: [], components: [] }).catch(() => { })
            })
    }

    async loadMessage() {

        this.message.edit({
            content: `${e.Loading} | Carregando bandeiras e iniciando uma partida no modo ${this.gameData.mode}`,
            embeds: [], components: []
        }).catch(() => this.unregister())

        return this.load()
    }

    load() {
        this.gameData.flags.push(...Flags.sort(() => Math.random() - Math.random()))
        return setTimeout(() => this.start(), 2500)
    }

    async start(isNext = false) {

        this.gameData.round++
        if (!isNext)
            this.message.delete().catch(() => this.unregister())

        const flag = this.getFlag()
        const fields = []

        if (this.gameData.mode == 'party') {
            const points = Object.entries(this.gameData.points || {})
            const first = points.sort((a, b) => b[1] - a[1]).slice(0, 3)
            fields.push({
                name: '🏆 Top 3 Player',
                value: `${first ? `${first.map(([a, b], i) => `${emoji(i)} <@${a}> - ${b} acertos`).join('\n') || "Ninguém por enquanto"}` : 'Ninguém por enquanto'}`
            })
        }

        const components = this.generateButtons(flag)

        const data = {
            embeds: [{
                color: client.blue,
                title: `🗺️ ${client.user.username}'s Bandeiras Quiz`,
                description: `${e.Loading} | Que bandeira é essa?\n⏱️ | ${time(new Date(Date.now() + this.timer), 'R')}`,
                fields,
                image: { url: flag.image },
                footer: {
                    text: `${this.gameData.round}/${Flags.length} Rounds`
                }
            }],
            components,
            fetchReply: true
        }

        this.message = isNext
            ? await this.message.edit(data).catch(() => this.unregister())
            : await this.interaction.channel.send(data).catch(() => this.unregister())

        const style = this.gameData.style
        return style === 'keyboard'
            ? this.collectKeyboard(flag)
            : this.collectInteraction(flag)
    }

    async collectKeyboard(flag) {
        let responded = false

        const filter = this.gameData.mode === 'solo'
            ? msg => flag.country.map(str => str.toLowerCase()).includes(msg?.content?.toLowerCase()) && msg.author.id === this.user.id
            : msg => flag.country.map(str => str.toLowerCase()).includes(msg?.content?.toLowerCase()) && !msg.author.bot

        const collector = await this.channel.createMessageCollector({ filter, idle: this.timer, max: 1, errors: ['idle'] });
        const timeout = setTimeout(() => collector.stop(), this.timer);

        return collector
            .on('collect', async message => {

                clearTimeout(timeout)
                responded = true
                const { author } = message
                message.react(flag.flag).catch(() => { })
                const countryName = `**${flag.flag} - ${flag.country[0].captalize()}**`
                const embed = this.message.embeds[0].data
                embed.color = client.green
                embed.footer = { text: `${author.tag} acertou esta bandeira` }
                embed.description = `${this.gameData.mode === 'solo' ? 'Você' : `${author.tag}`} acertou o país ${countryName}`

                this.gameData.points[author.id]
                    ? this.gameData.points[author.id]++
                    : this.gameData.points[author.id] = 1
                this.savePoint(author.id)

                embed.fields = [{
                    name: `🏆 Acertos`,
                    value: `${author} acertou ${this.gameData.points[author.id]} bandeira${this.gameData.points[author.id] === 1 ? '' : 's'}`
                }]

                this.message.edit({ embeds: [embed] }).catch(() => { })
                this.message = await this.channel.send({
                    embeds: [{
                        color: client.blue,
                        description: `${e.Loading} | Carregando próxima bandeira...`
                    }],
                    fetchReply: true
                }).catch(() => this.unregister())

                return setTimeout(() => this.start(true), 2500)
            })
            .on('end', async (_, reason) => {

                if (responded) return
                clearTimeout(() => timeout)
                this.unregister()

                if (reason == 'channelDelete') return

                if (!this.message)
                    return this.channel.send({
                        content: `${e.Info} | A mensagem do jogo não foi encontrada. Por favor, não apague a mensagem ou tente bugar este jogo. Jogo finalizado e dados salvados.`
                    })

                if (reason == 'messageDelete')
                    return this.channel.send({
                        content: `${e.Info} | A mensagem do Quiz foi deletada e o jogo interrompido. Os dados do jogo foram salvos.`
                    })

                const embed = this.message.embeds[0].data
                embed.color = client.red
                embed.footer = { text: `Jogo Finalizado | ${embed.footer.text}` }
                embed.description = `${this.gameData.mode === 'solo' ? 'Você não' : 'Ninguém'} acertou o país **${flag.flag} ${flag.country[0]?.captalize()}**`

                const points = Object.entries(this.gameData.points || {}) || []
                const first = points.sort((a, b) => b[1] - a[1]).slice(0, 3) || []

                if (first?.length && this.gameData.mode == 'party') {
                    const mapped = first.map(([id, points], i) => `${emoji(i)} <@${id}> - ${points} Acertos`)
                    let description = mapped.join('\n')

                    if (description.length > 4012)
                        description = `${mapped.slice(0, 50).join('\n')}\n+${mapped.slice(50, mapped.length).length} players`

                    this.channel.send({
                        embeds: [{
                            color: client.blue,
                            title: `🏆 ${client.user.username}'s Bandeiras Final Game`,
                            description,
                            footer: {
                                text: `${points.length} pessoas acertaram pelo menos 1 bandeira nesta partida`
                            }
                        }]
                    })
                }

                if (first?.length && this.gameData.mode == 'solo')
                    embed.fields = [{
                        name: `${e.waku} WOW`,
                        value: `Você acertou um total de ${points[0][1]} bandeiras`
                    }]
                return this.message.edit({ embeds: [embed] }).catch(() => { })

            })
            .on('ignore', async () => {
                this.gameData.tries++

                if (this.gameData.tries >= 14) {
                    clearTimeout(timeout)
                    responded = true
                    collector.stop()
                    const embed = this.message.embeds[0].data
                    await this.message.delete().catch(() => { })
                    this.message = undefined
                    this.resend(flag, embed)
                    return this.gameData.tries = 0
                }
                return
            })

    }

    async collectInteraction(flag) {

        if (!this.message) return

        let responded = false
        const alreadyReplied = []

        const filter = this.gameData.mode === 'solo'
            ? int => int.user.id === this.user.id && !alreadyReplied.includes(int.user.id)
            : () => true

        const collector = await this.message.createMessageComponentCollector({ filter, idle: this.timer, errors: ['idle'] });
        const timeout = setTimeout(() => collector.stop(), this.timer);

        return collector
            .on('collect', async int => {

                const { user, customId } = int

                if (alreadyReplied.includes(user.id))
                    return await int.reply({
                        content: `${e.Deny} | Você já errou esta rodada. Espere a próxima, ok?`,
                        ephemeral: true
                    })

                if (!flag.country.includes(customId)) {

                    if (this.gameData.mode === 'solo')
                        return collector.stop()

                    alreadyReplied.push(user.id)
                    return await int.reply({
                        content: `${e.Deny} | Você errou o país nesta rodada.`,
                        ephemeral: true
                    })
                }

                if (responded) return
                responded = true

                clearTimeout(timeout)
                const countryName = `**${flag.flag} - ${flag.country[0].captalize()}**`
                const embed = this.message.embeds[0].data
                embed.color = client.green
                embed.footer = { text: `${user.tag} acertou esta bandeira` }
                embed.description = `${this.gameData.mode === 'solo' ? 'Você' : `${user.tag}`} acertou o país ${countryName}`

                this.gameData.points[user.id]
                    ? this.gameData.points[user.id]++
                    : this.gameData.points[user.id] = 1
                this.savePoint(user.id)

                embed.fields = [{
                    name: `🏆 Acertos`,
                    value: `${user} acertou ${this.gameData.points[user.id]} bandeira${this.gameData.points[user.id] === 1 ? '' : 's'}`
                }]

                int.update({ embeds: [embed], components: [] }).catch(() => { })
                this.message = await this.channel.send({
                    embeds: [{
                        color: client.blue,
                        description: `${e.Loading} | Carregando próxima bandeira e gerando novos botões...`
                    }],
                    fetchReply: true
                }).catch(() => this.unregister())

                return setTimeout(() => this.start(true), 2500)
            })
            .on('end', async () => {

                if (responded) return
                clearTimeout(() => timeout)

                this.unregister()
                const embed = this.message.embeds[0].data
                embed.color = client.red
                embed.footer = { text: `Jogo Finalizado | ${embed.footer.text}` }
                embed.description = `${this.gameData.mode === 'solo' ? 'Você não' : 'Ninguém'} acertou o país **${flag.flag} ${flag.country[0]?.captalize()}**`

                const points = Object.entries(this.gameData.points || {}) || []
                const first = points.sort((a, b) => b[1] - a[1]).slice(0, 3) || []

                if (first?.length && this.gameData.mode == 'party') {
                    const mapped = first.map(([id, points], i) => `${emoji(i)} <@${id}> - ${points} Acertos`)
                    let description = mapped.join('\n')

                    if (description.length > 4012)
                        description = `${mapped.slice(0, 50).join('\n')}\n+${mapped.slice(50, mapped.length).length} players`

                    this.channel.send({
                        embeds: [{
                            color: client.blue,
                            title: `🏆 ${client.user.username}'s Bandeiras Final Game`,
                            description,
                            footer: {
                                text: `${points.length} pessoas acertaram pelo menos 1 bandeira nesta partida`
                            }
                        }]
                    })
                }

                if (first?.length && this.gameData.mode == 'solo')
                    embed.fields = [{
                        name: `${e.waku} WOW`,
                        value: `Você acertou um total de ${points[0][1]} bandeiras`
                    }]
                return this.message.edit({ embeds: [embed], components: [] }).catch(() => { })

            })
            .on('ignore', async () => {
                this.gameData.tries++

                if (this.gameData.tries >= 14) {
                    clearTimeout(timeout)
                    responded = true
                    collector.stop()
                    const embed = this.message.embeds[0].data
                    await this.message.delete().catch(() => { })
                    this.message = undefined
                    this.resend(flag, embed)
                    return this.gameData.tries = 0
                }
                return
            })

    }

    generateButtons(flag) {

        if (this.gameData.style == 'keyboard') return []

        const flags = [flag, ...Flags.filter(flg => flg.image !== flag.image).random(4)].sort(() => Math.random() - Math.random())

        const buttons = [{
            type: 1,
            components: flags
                .map(flg => ({
                    type: 2,
                    label: flg.country[0].captalize(),
                    custom_id: flg.country[0],
                    style: ButtonStyle.Primary
                }))
        }]

        return buttons
    }

    getFlag() {

        if (!this.gameData.flags.length)
            return null

        this.gameData.actualFlag = this.gameData.flags.splice(Math.floor(Math.random() * this.gameData.flags.length), 1)[0]
        return this.gameData.actualFlag
    }

    async resend(flag, embed) {
        this.message = await this.channel.send({ embeds: [embed], fetchReply: true }).catch(() => { })
        return this.gameData.style === 'keyboard'
            ? this.collectKeyboard(flag)
            : this.collectInteraction(flag)
    }

    unregister() {
        if (!client.chatsInGame.find(id => id === this.channel.id)) return
        client.chatsInGame.splice(client.chatsInGame.findIndex(id => id === this.channel.id), 1)
        return;
    }

    async savePoint(userId) {
        await Database.User.updateOne(
            { id: userId },
            { $inc: { 'GamingCount.FlagCount': 1 } },
            { upsert: true }
        )
    }
}