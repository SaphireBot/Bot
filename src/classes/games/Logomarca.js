import { ButtonStyle } from 'discord.js'
import { formatString, emoji } from '../../functions/plugins/plugins.js'
import { Colors } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'
import { Base } from '../index.js'

export default class Logomarca extends Base {
    constructor(interaction, logoData) {
        super()
        this.interaction = interaction
        this.logoData = [...logoData].randomize()
        this.channel = interaction.channel
        this.channelId = interaction.channel.id
        this.buttons = undefined
        this.collected = false
        this.gameData = {
            counter: 0,
            round: 1,
            users: [],
            replied: [],
            sandBox: false,
            sandBoxActive: false
        }
        this.collectors = {}
        this.msg = undefined
        this.embed = { color: Colors[this.interaction.options.getString('color')] || 0x9bff85, fields: [] }
    }

    async registerNewGameAndStart() {
        const channelsInGame = await this.Database.Cache.Logomarca.get(`${this.client.shardId}.Channels`)

        if (channelsInGame?.includes(this.channelId)) return
        await this.Database.Cache.Logomarca.push(`${this.client.shardId}.Channels`, this.channelId)

        const embed = [{
            color: this.client.blue,
            title: `${e.logomarca} ${this.client.user.username}'s Logo & Marca Quiz`,
            description: `${e.Loading} | Carregando Logos & Marcas e registrando canal...`
        }]

        this.msg = this.interaction.replied
            ? await this.channel.send({ embeds: embed })
                .catch(() => { })
            : await this.interaction.reply({ embeds: embed, fetchReply: true })
                .catch(() => { })

        return setTimeout(() => this.game(), 2000)
    }

    getLogo() {
        let logo = this.gameData.sandBox ? this.logoData.random() : this.logoData[0]

        if (!logo) {
            this.gameData.sandBox = true

            if (!this.gameData.sandBoxActive) {
                this.gameData.sandBoxActive = true

                this.embed.thumbnail = { url: 'https://media.discordapp.net/attachments/893361065084198954/1023675995414331462/mission_complete.gif' }

                this.channel.send({
                    embeds: [{
                        color: this.client.green,
                        title: `${e.Check} SandBox Ativado`,
                        description: 'Todas as logomarcas foram acertadas e o modo aleatório foi ativado. Logomarcas irão se repetir e o único objetivo é o acumulo de pontos. Boa sorte.',
                        thumbnail: {
                            url: 'https://media.discordapp.net/attachments/893361065084198954/1023672587286495333/unknown.png'
                        }
                    }]
                })

                    .catch(() => { })
            }

            this.logoData = [...this.Database.Logomarca]?.randomize()
            logo = this.logoData[0]
        }

        if (!this.gameData.sandBox) this.logoData.splice(0, 1)
        return logo
    }

    async game() {

        const logo = this.getLogo()
        if (!logo) return this.finish()

        this.collected = false
        this.gameData.logo = logo
        this.embed.image = { url: logo.images.censored ?? logo.images.uncensored }
        this.embed.title = `${e.logomarca} ${this.client.user.username}'s Logo & Marca Quiz`
        this.embed.description = `${e.Loading} Qual o nome desta marca?`
        this.embed.footer = { text: `Round: ${this.gameData.round} | ${this.gameData.sandBox ? 'SANDBOX ATIVADO' : `${this.logoData.length} Imagens Restantes`}` }
        this.generateButtons(logo)
        this.msg?.delete()
            .catch(() => { })

        this.msg = this.interaction.replied
            ? await this.channel.send({ embeds: [this.embed], components: [this.buttons] })
                .catch(() => { })
            : await this.interaction.reply({ embeds: [this.embed], components: [this.buttons], fetchReply: true })
                .catch(() => { })

        return this.initCollectors()
    }

    async initCollectors() {

        this.gameData.round++

        this.collectors.collectorCounter = this.channel.createMessageCollector({
            filter: () => true,
            time: 20000
        })
            .on('collect', async () => {

                this.gameData.counter++
                if (this.gameData.counter < 10) return
                this.msg.delete()
                    .catch(() => { })

                this.gameData.counter = 0

                this.collectors.collectorCounter.stop()
                this.collectors.collectorRightAnswer.stop()

                this.msg = this.interaction.replied
                    ? await this.channel.send({ embeds: [this.embed], components: [this.buttons] })
                        .catch(() => { })
                    : await this.interaction.reply({ embeds: [this.embed], components: [this.buttons], fetchReply: true })
                        .catch(() => { })

                return this.initCollectors()

            })
            .on('end', (_, r) => {
                if (r === 'user') return
                this.collectors.collectorRightAnswer?.stop()
                return this.finish()
            })

        this.collectors.collectorRightAnswer = this.msg.createMessageComponentCollector({
            filter: int => !int.user.bot,
            time: 20000,
            errors: ['time']
        })
            .on('collect', async int => {

                if (this.gameData.replied.includes(int.user.id))
                    return await int.reply({
                        content: `${e.saphireRight} | Você errou a logomarca nesta rodada. Espere a próxima para responder novamente.`,
                        ephemeral: true
                    })

                const { customId } = int

                if (customId !== 'correct') {

                    this.gameData.replied.push(int.user.id)
                    return await int.reply({
                        content: `${e.Deny} | Logomarca Quiz | Resposta errada.`,
                        ephemeral: true
                    })
                }

                if (this.collected) return

                this.collected = true
                this.collectors.collectorCounter?.stop()
                this.gameData.counter = 0
                this.gameData.replied = []
                this.addAccept(int.user.id)
                this.embed.image = { url: this.gameData.logo.images.uncensored }
                this.embed.description = `${e.Check} | ${int.user} acertou a marca \`${formatString(this.gameData.logo.answers[0])}\`\n${e.Loading} | Carregando próximo round...`
                this.msg.delete()
                    .catch(() => { })

                this.msg = await int.reply({
                    embeds: [this.embed],
                    fetchReply: true
                })

                return setTimeout(() => this.game(), 4000)
            })
    }

    async addAccept(userId) {

        const has = this.gameData.users.find(u => u.id === userId)

        has
            ? has.points++
            : this.gameData.users.push({ id: userId, points: 1 })

        this.format()
        await this.Database.Cache.Logomarca.add(`Points.${userId}`, 1)

        return
    }

    async format() {
        const mapped = this.gameData.users.sort((a, b) => b.points - a.points).slice(0, 7).map((u, i) => `${emoji(i)} ${this.interaction.guild.members.cache.get(u.id) || 'Not Found'} - ${u.points} Pontos`).join('\n')

        this.embed.fields[0]
            ? this.embed.fields[0] = { name: 'Pontuação', value: mapped || 'Nenhum usuário foi encontrado' }
            : this.embed.fields.unshift({ name: 'Pontuação', value: mapped || 'Nenhum usuário foi encontrado' })

        return
    }

    async finish() {
        await this.Database.Cache.Logomarca.pull(`${this.client.shardId}.Channels`, this.channelId)
        this.embed.color = this.client.red
        this.embed.description = `${e.Deny} | Ninguém acertou a marca \`${formatString(this.gameData.logo.answers[0])}\``
        this.embed.image = { url: this.gameData.logo.images.uncensored }
        this.msg.delete()
            .catch(() => { })


        this.msg = await this.channel.send({
            embeds: [this.embed],
            components: [
                {
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'REINICIAR',
                        emoji: '🔄',
                        custom_id: 'reset',
                        style: ButtonStyle.Primary
                    }]
                }
            ]
        })
            .catch(() => { })

        const dataToUpdate = []
        const cachedPointsData = await this.Database.Cache.Logomarca.get('Points') || {}
        const usersPointData = Object.entries(cachedPointsData || {}).map(([a, b]) => ({ id: a, points: b }))

        //       [{ id: userId, points: Number }]
        for (let data of usersPointData)
            dataToUpdate.push({
                updateOne: {
                    filter: { id: data.id },
                    update: {
                        $inc: { ['GamingCount.Logomarca']: data.points }
                    },
                    upsert: true
                }
            })

        this.Database.User.collection.bulkWrite(dataToUpdate, { ordered: true }, () => { })

        for await (let data of usersPointData)
            await this.Database.Cache.Logomarca.delete(`Points.${data.id}`)

        return this.resetGame()
    }

    async resetGame() {

        return this.msg.createMessageComponentCollector({
            filter: () => true,
            time: 60000
        })
            .on('collect', async int => {

                this.logoData = [...this.Database.Logomarca].randomize()
                this.buttons = undefined
                this.gameData = {
                    counter: 0,
                    round: 1,
                    users: [],
                    replied: [],
                    sandBox: false,
                    sandBoxActive: false
                }
                this.collectors = {}

                this.msg = undefined
                this.embed = { color: Colors[this.interaction.options.getString('color')] || 0x9bff85, fields: [] }

                await this.Database.Cache.Logomarca.pull(`${this.client.shardId}.Channels`, this.channelId)
                await int.update({ components: [] }).catch(() => { })
                return this.registerNewGameAndStart()
            })
            .on('end', () => this.msg.edit({ components: [] }).catch(() => { }))

    }

    generateButtons(logo) {

        const buttons = { type: 1, components: [] }
        const correct = logo.answers.random()
        const incorrect = this.Database.Logomarca.random(5).filter(logomarca => !logomarca.answers.includes(correct))

        if (incorrect.length > 4) incorrect.length = 4

        const answers = [correct, ...incorrect.map(lg => lg.answers.random())].randomize()

        for (let answer of answers)
            buttons.components.push({
                type: 2,
                label: formatString(answer),
                custom_id: answer === correct ? 'correct' : answer,
                style: ButtonStyle.Primary
            })

        this.buttons = buttons
        return
    }

}