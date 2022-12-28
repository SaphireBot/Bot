import { SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import Base from './Base.js'
import memoryGame from './buttons/memoryGame/solo.memory.js'
import tictactoe from './buttons/tictactoe/game.tictactoe.js'
import blackjack from './buttons/blackjack/game.blackjack.js'
import blackjackMultiplayer from './buttons/blackjack/game.blackjack.multiplayer.js'
import likePerfil from './buttons/perfil/like.perfil.js'
import payment from './buttons/payment/new.pay.js'
import rather from './buttons/rather/game.rather.js'
import ratherAdminEdit from './buttons/rather/admin/edit.rather.js'
import anime from './buttons/anime/index.anime.js'
import wordleGameInfoModal from './modals/wordleGame/wordleGame.info.modal.js'
import channelIndex from './buttons/channel/channel.index.js'
import rifa from './buttons/rifa/rifa.js'
import raspadinha from './buttons/raspadinha/index.raspadinha.js'
import corridaFunctions from './buttons/corrida/reset.corrida.js'
import tradeInfo from './buttons/saphireInfo/trade.info.js'
import fanartsSaphire from '../commands/functions/bot/fanarts.saphire.js'
import roleAnunciar from '../commands/functions/anunciar/role.anunciar.js'
import copyPixDonate from './buttons/donate/copyPix.donate.js'

export default class ButtonInteraction extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.customId = interaction.customId
        this.message = interaction.message
        this.user = interaction.user
        this.channel = interaction.channel
        this.guild = interaction.guild
        this.commandName = this.message.interaction?.commandName
        this.command = this.message.interaction
    }

    async execute() {

        if (!this.customId.includes('{')) return
        const commandData = JSON.parse(this.customId)
        if (!commandData) return
        this.customId = commandData?.src ? commandData.src : `${commandData}`

        if (commandData.c === 'delete' && this.user.id === this.command.user.id)
            return await this.message?.delete().catch(() => { })

        if (commandData.src === 'again') return await this.interaction.showModal(this.modals.indicateLogomarca)
        if (/\d{18,}/.test(`${this.customId}`) && this.commandName === commandData.c) return this.wordleGame()
        if (['giveup-ephemeral', 'giveup'].includes(commandData.src) && this.commandName === commandData.c) return this.wordleGame(true)

        const result = {
            mg: [memoryGame, this.interaction, this.customId],
            ttt: [tictactoe, this.interaction, this.customId],
            bj: [blackjack, this.interaction, this.customId],
            bjm: [blackjackMultiplayer, this.interaction, this.customId],
            like: [likePerfil, this.interaction, this.customId],
            pay: [payment, this.interaction, this.customId],
            corrida: [corridaFunctions, this.interaction],
            redit: [ratherAdminEdit, this],
            rt: [rather, this.interaction, commandData],
            anime: [anime, this.interaction, commandData],
            channel: [channelIndex, this.interaction, commandData],
            rifa: [rifa, this.interaction, commandData],
            rasp: [raspadinha, this.interaction, commandData],
            saphire: [tradeInfo, this.interaction, commandData],
            fanart: [fanartsSaphire, this.interaction, commandData, true],
            anunciar: [roleAnunciar, this.interaction],
            donate: [copyPixDonate, this.interaction, commandData],
            ping: [this.refeshPing, this.interaction],
        }[commandData.c]

        if (result) return await result[0](...result?.slice(1))

        const byCustomId = {
            WordleGameInfo: [wordleGameInfoModal, this]
        }[this.customId]

        if (byCustomId) return await byCustomId[0](byCustomId[1])

        const byThis = {
            newProof: ['newProof'],
            cancelVote: ['cancelVote'],
            copy: ['copyCripto']
        }[this.customId]

        if (byThis)
            return await this[byThis]()

        return
    }

    async refeshPing(interaction) {

        if (interaction.user.id !== interaction.message.interaction.user.id) return

        const pingCommand = client.slashCommands.find(cmd => cmd.name === 'ping')

        if (!pingCommand)
            return await interaction.update({
                content: `${e.Deny} | Comando não encontrado`,
                components: []
            }).catch(() => { })

        return await pingCommand.execute({ interaction, client, e }, true)
    }

    async copyCripto() {

        const { embeds } = this.message
        const embed = embeds[0]?.data

        if (!embed)
            return await this.interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            }).catch(() => { })

        const textCripto = embed.fields[1]?.value

        if (!textCripto)
            return await this.interaction.update({
                content: `${e.Deny} | Texto criptografado não encontrado.`,
                components: []
            }).catch(() => { })

        return await this.interaction.reply({
            content: textCripto,
            ephemeral: true
        })

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

}