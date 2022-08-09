import Base from './Base.js'
import { Api } from '@top-gg/sdk'

import {
    ChannelType,
    OverwriteType,
    PermissionFlagsBits as Permissions
} from 'discord.js'

export default class ButtonInteraction extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.customId = interaction.customId
        this.message = interaction.message
        this.user = interaction.user
        this.channel = interaction.channel
        this.guild = interaction.guild
        this.commandName = interaction.message.interaction?.commandName
    }

    async execute() {

        if (/\d{18,}/.test(this.customId) && this.commandName === 'wordle') return this.wordleGame()
        if (['giveup-ephemeral', 'giveup'].includes(this.customId) && this.commandName === 'wordle') return this.wordleGame(true)

        switch (this.customId) {
            case 'editProfile': this.editProfile(); break;
            case 'newProof': this.newProof(); break;
            case 'closeProof': this.newProof(true); break;
            case 'getVotePrize': this.topGGVote(); break;
            case 'cancelVote': this.cancelVote(); break;
            case 'WordleGameInfo': import('./modals/wordleGame/wordleGame.info.modal.js').then(commandInfo => commandInfo.default(this)); break;
            default:
                await this.interaction.reply({
                    content: `${this.emojis.QuestionMark} | Interação Desconhecida.`,
                    ephemeral: true
                })
                break;
        }

        return
    }

    async cancelVote() {
        const commandUserId = this.message.interaction.user.id
        if (commandUserId !== this.user.id) return await this.interaction.deferUpdate().catch(() => { })
        return this.message.delete().catch(() => { })
    }

    async wordleGame(giveup) {

        const { message, user } = this.interaction

        if (this.customId === 'giveup-ephemeral') {

            const data = await this.Database.Cache.WordleGame.get('inGame')
            const game = data.find(value => value.userId === user.id)

            if (!game)
                return await message.edit({
                    content: `${this.emojis.Deny} | Jogo inexistente.`,
                    components: []
                })

            const deleted = await this.Database.Cache.WordleGame.delete(game.messageId)
            await this.Database.Cache.WordleGame.pull('inGame', data => data.userId === user.id)

            if (deleted)
                return await message.edit({
                    content: `${this.emojis.Check} | Jogo deletado com sucesso.`,
                    components: []
                })
            else
                return await message.edit({
                    content: `${this.emojis.Info} | Jogo não encontrado no banco de dados.`,
                    components: []
                })
        }

        const wordleGameData = await this.Database.Cache.WordleGame.get(message.id)
        const embed = message.embeds[0]?.data

        if (!embed || !wordleGameData)
            return message.edit({
                content: `${this.emojis.Deny} | Jogo inválido.`,
                components: [], embeds: []
            }).catch(() => { })

        if (!wordleGameData?.Players.includes(user.id)) return await interaction.deferReply()

        if (giveup) {

            const playersInGame = await this.Database.Cache.WordleGame.get('inGame')
            const game = playersInGame.find(data => data.messageId === message.id)

            if (game.userId !== this.user.id)
                return await this.interaction.reply({
                    content: `${this.emojis.Deny} | Apenas <@${game.userId}> pode desistir desse jogo.`,
                    ephemeral: true
                })

            embed.description = `${this.emojis.Deny} | Poxa... Achei que você ia conseguir...\n${this.emojis.Info} | A palavra escondida era \`${wordleGameData.Word}\``
            embed.color = this.client.red
            await this.Database.Cache.WordleGame.delete(message.id)
            await this.Database.Cache.WordleGame.pull('inGame', data => data.userId === user.id)
            return message.edit({ embeds: [embed], components: [] }).catch(() => { })
        }

        return await this.interaction.showModal(this.modals.wordleGameNewTry(message.id, wordleGameData.Length))
    }

    async newProof(close = false) {

        const channel = this.guild.channels.cache.find(ch => ch.topic === this.user.id)

        if (close) {
            if (!channel)
                return await this.interaction.reply({
                    content: `${this.emojis.Deny} | Você não possui nenhum canal aberto no servidor.`,
                    ephemeral: true
                })

            channel.delete().catch(async () => {
                return await this.interaction.reply({
                    content: `${this.emojis.Deny} | Falha ao deletar o seu canal.`,
                    ephemeral: true
                })
            })

            return await this.interaction.reply({
                content: `${this.emojis.Check} | Canal deletado com sucesso!`,
                ephemeral: true
            })
        }

        if (channel)
            return await this.interaction.reply({
                content: `${this.emojis.Deny} | Você já possui um canal aberto no servidor. Ele está aqui: ${channel}`,
                ephemeral: true
            })

        return this.guild.channels.create({
            name: this.user.tag,
            type: ChannelType.GuildText,
            topic: this.user.id,
            parent: null,
            permissionOverwrites: [
                {
                    id: this.guild.roles.everyone.id,
                    deny: [
                        Permissions.ViewChannel
                    ],
                    type: OverwriteType.Role
                },
                {
                    id: this.user.id,
                    deny: [
                        Permissions.ViewChannel,
                        Permissions.SendMessages,
                        Permissions.AttachFiles,
                        Permissions.EmbedLinks,
                        Permissions.AddReactions
                    ],
                    type: OverwriteType.Member
                }
            ],
            reason: `Solicitado por ${this.user.id}`
        })
            .then(async channelCreated => {

                channelCreated.send(`${this.emojis.Check} | ${this.user}, o seu canal de comprovante foi aberto com sucesso!\n🔍 | Mande o **COMPROVANTE** do pagamento/pix/transação contendo **DATA, HORA e VALOR**.\n${this.emojis.Info} | Lembrando! Cada real doado é convertido em 15.000 Safiras + 7 Dias de VIP`)

                return await this.interaction.reply({
                    content: `${this.emojis.Check} | Canal criado com sucesso. Aqui está ele: ${channelCreated}`,
                    ephemeral: true
                })
            })
            .catch(async err => {

                if (err.code === 30013)
                    return await this.interaction.reply({
                        content: `${this.emojis.Info} | O servidor atingiu o limite de **500 canais**.`,
                        ephemeral: true
                    })

                return await this.interaction.reply({
                    content: `${this.emojis.Deny} | Ocorreu um erro ao criar um novo canal.\n\`${err}\``,
                    ephemeral: true
                })
            })
    }

    async editProfile() {

        const data = await this.Database.getUser({ user: this.user, filter: 'Perfil' })
        const title = data?.Perfil?.Titulo || null
        const job = data?.Perfil?.Trabalho || null
        const niver = data?.Perfil?.Aniversario || null
        const status = data?.Perfil?.Status || null
        const modal = this.modals.editProfileModal

        if (job) {
            modal.components[0].components[0].label = job ? 'Alterar Profissão' : 'Qual sua profissão?'
            modal.components[0].components[0].value = job.length >= 5 ? job : null
        }

        if (niver) {
            modal.components[1].components[0].label = niver ? 'Alterar Aniversário' : 'Digite seu aniversário'
            modal.components[1].components[0].value = niver.length >= 5 ? niver : null
        }

        if (status) {
            modal.components[2].components[0].label = status ? 'Alterar Status' : 'Digite seu novo status'
            modal.components[2].components[0].value = status.length >= 5 ? status : null
        }

        if (data?.Perfil?.TitlePerm)
            modal.components.unshift({
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "profileTitle",
                        label: title ? "Alterar título" : "Qual seu título?",
                        style: 1,
                        min_length: 3,
                        max_length: 20,
                        placeholder: "Escrever novo título",
                        value: title?.length >= 3 && title?.length <= 20 ? title : null
                    }
                ]
            })

        return await this.interaction.showModal(modal)
    }

    async topGGVote() {

        const TopGG = new Api(process.env.TOP_GG_TOKEN)
        const hasVoted = await TopGG.hasVoted(this.user.id)

        // const Reminder = require('./Reminder')
        const userData = await this.Database.getUser({ user: this.user, filter: 'Timeouts.TopGGVote Balance' })
        const guildData = await this.Database.getGuild({ guildId: this.guild.id, filter: 'Moeda' })
        const timeout = this.client.Timeout({ TimeoutInMS: 43200000, DateNowAtDatabase: userData?.Timeouts.TopGGVote })
        const moeda = guildData?.Moeda || `${this.emojis.Coin} Safiras`

        if (!hasVoted)
            return await this.interaction.reply({
                content: `${this.emojis.Deny} | Você precisa votar primeiro. Clica no botão votar, vote, depois resgate seu prêmio.`,
                ephemeral: true
            })

        if (hasVoted && timeout)
            return await this.interaction.reply({
                content: `${this.emojis.Info} | ${this.user}, você já votou nas últimas 12 horas. Espere esse tempo passar.`,
                ephemeral: true
            })

        await this.Database.User.updateOne(
            { id: this.user.id },
            {
                $inc: {
                    Balance: 3000,
                    Xp: 1000
                },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)} - ${userData?.Balance || 0}`,
                            data: `${this.emojis.gain} Resgatou seu *Top.gg Vote* e ganhou 5000 Safiras`
                        }],
                        $position: 0
                    }
                },
                'Timeouts.TopGGVote': Date.now()
            },
            { upsert: true }
        )

        const msg = await this.interaction.reply({
            content: `${this.emojis.Check} | ${this.user}, você resgatou sua recompensa de voto e ganhou **+5000 ${moeda}** & **+1000 XP ${this.emojis.RedStar}**`,
            fetchReply: true
        })

        // return new Reminder(msg, {
        //     time: 43200000, // 12 hours
        //     user: this.user,
        //     client: client,
        //     confirmationMessage: `⏰ | Beleza, ${this.user}! Eu vou te lembrar de votar novamente daqui \`ReplaceTIMER\``,
        //     reminderData: {
        //         userId: this.user.id,
        //         RemindMessage: 'AUTOMATIC REMINDER | Voto Disponível',
        //         Time: 43200000,
        //         DateNow: Date.now(),
        //         isAutomatic: true,
        //         ChannelId: this.channel.id
        //     }
        // }).showButton()

    }

}