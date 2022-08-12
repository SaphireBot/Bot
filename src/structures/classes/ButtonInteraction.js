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

        if (!this.customId.includes('{')) return
        const commandData = JSON.parse(this.customId)
        if (!commandData) return
        this.customId = commandData?.src ? commandData.src : `${commandData}`

        if (/\d{18,}/.test(`${this.customId}`) && this.commandName === commandData.c) return this.wordleGame()
        if (['giveup-ephemeral', 'giveup'].includes(commandData.src) && this.commandName === commandData.c) return this.wordleGame(true)

        switch (`${this.customId}`) {
            case 'editProfile': this.editProfile(); break;
            case 'newProof': this.newProof(); break;
            case 'cancelVote': this.cancelVote(); break;
            case 'WordleGameInfo': import('./modals/wordleGame/wordleGame.info.modal.js').then(commandInfo => commandInfo.default(this)); break;
            default:
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

        if (!embed || !wordleGameData) {
            await this.Database.Cache.WordleGame.delete(message.id)
            return message.edit({
                content: `${this.emojis.Deny} | Jogo inválido.`,
                components: [], embeds: []
            }).catch(() => { })
        }

        if (!wordleGameData?.Players.includes(user.id)) return await this.interaction.deferReply()

        if (giveup) {

            const playersInGame = await this.Database.Cache.WordleGame.get('inGame')
            const game = playersInGame.find(data => data.messageId === message.id)

            if (game && game.userId !== this.user.id)
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

}