import { ButtonStyle, ButtonInteraction as DiscordButtonInteraction } from 'discord.js';
import { Modals, SaphireClient as client, Database } from '../../classes/index.js';
import { Emojis as e } from '../../util/util.js';
import Base from './Base.js';
import memoryGame from './buttons/memoryGame/solo.memory.js';
import tictactoe from './buttons/tictactoe/game.tictactoe.js';
import blackjack from './buttons/blackjack/game.blackjack.js';
import blackjackMultiplayer from './buttons/blackjack/game.blackjack.multiplayer.js';
import star from './buttons/perfil/star.perfil.js';
import likePerfil from './buttons/perfil/like.perfil.js';
import payment from './buttons/payment/new.pay.js';
import rather from './buttons/rather/game.rather.js';
import ratherAdminEdit from './buttons/rather/admin/edit.rather.js';
import anime from './buttons/anime/index.anime.js';
import wordleGameInfoModal from './modals/wordleGame/wordleGame.info.modal.js';
import channelIndex from './buttons/channel/channel.index.js';
import rifa from './buttons/rifa/rifa.js';
import raspadinha from './buttons/raspadinha/index.raspadinha.js';
import corridaFunctions from './buttons/corrida/reset.corrida.js';
import tradeInfo from './buttons/saphireInfo/trade.info.js';
import fanartsSaphire from '../commands/functions/bot/fanarts.saphire.js';
import roleAnunciar from '../commands/functions/anunciar/role.anunciar.js';
import copyPixDonate from './buttons/donate/copyPix.donate.js';
import bg from './buttons/level/background.level.js';
import counterPoll from './buttons/poll/counter.poll.js';
import executeCantada from './buttons/cantadas/execute.cantada.js';
import executeAmongus from './buttons/amongus/execute.amongus.js';
import indexBet from './buttons/bet/index.bet.js';
import validadeAnimeQuiz from './buttons/anime/validate.quiz.js';
import checkerQuiz from './buttons/quiz/checker.quiz.js';
import giveaway from './buttons/giveaway/giveaway.button.js';
import botinfoSaphire from '../commands/functions/bot/botinfo.saphire.js';
import commands from '../commands/functions/bot/commands.saphire.js';
import mydata from '../commands/slash/bot/mydata.js';
import pagesServerinfo from '../commands/functions/serverinfo/pages.serverinfo.js';
import connect from './buttons/connect/redirect.connect.js';
import checkJokempo from './buttons/jokempo/redirect.jokempo.js';
import twitch from './buttons/twitch/redirect.twitch.js';
import serverRedirect from './buttons/server/redirect.server.js';
import images from '../commands/functions/nsfw/images.js';
import tempcall from './buttons/tempcall/redirect.tempcall.js';
import chest from './buttons/chest/button.chest.js';
import redirectSpam from './selectmenu/spam/redirect.spam.js';
import buttonHangman from './buttons/hangman/button.hangman.js';
import admin from './buttons/admin/redirect.admin.js';
import vipButtons from './buttons/vip/vip.buttons.js';
import marry from './buttons/marry/marry.buttons.js';
import reminderButtons from './buttons/reminder/redirect.js';
import { socket } from '../../websocket/websocket.js';

export default class ButtonInteraction extends Base {
    /**
     * @param { DiscordButtonInteraction } interaction 
     */
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.customId = interaction.customId
        this.message = interaction.message
        this.user = interaction.user
        this.member = interaction.member
        this.channel = interaction.channel
        this.guild = interaction.guild
        this.commandName = this.message.interaction?.commandName
        this.command = this.message.interaction
        this.e = this.emojis
    }

    execute() {

        if (!this.customId.includes('{')) return
        const commandData = JSON.parse(this.customId)
        if (!commandData) return
        this.customId = commandData?.src ? commandData.src : `${commandData}`

        if (commandData.src === 'again') return this.interaction.showModal(this.modals.indicateLogomarca)
        if (/\d{18,}/.test(`${this.customId}`) && this.commandName === commandData.c) return this.wordleGame()
        if (['giveup-ephemeral', 'giveup'].includes(commandData.src) && this.commandName === commandData.c) return this.wordleGame(true)

        const result = {
            mg: [memoryGame, this.interaction, this.customId],
            ttt: [tictactoe, this.interaction, this.customId],
            bj: [blackjack, this.interaction, this.customId],
            bjm: [blackjackMultiplayer, this.interaction, this.customId],
            like: [likePerfil, this.interaction, this.customId],
            pay: [payment, this.interaction, this.customId],
            bg: [bg, this.interaction],
            corrida: [corridaFunctions, this.interaction],
            redit: [ratherAdminEdit, this],
            admin: [admin, this.interaction],
            rt: [rather, this.interaction, commandData],
            anime: [anime, this.interaction, commandData],
            animeQuiz: [validadeAnimeQuiz, this.interaction, commandData],
            quiz: [checkerQuiz, this.interaction, commandData],
            channel: [channelIndex, this.interaction, commandData],
            rifa: [rifa, this.interaction, commandData],
            rasp: [raspadinha, this.interaction, commandData],
            star: [star, this.interaction, commandData],
            saphire: [tradeInfo, this.interaction, commandData],
            fanart: [fanartsSaphire, this.interaction, commandData, true],
            anunciar: [roleAnunciar, this.interaction],
            donate: [copyPixDonate, this.interaction, commandData],
            ping: [this.refeshPing, this.interaction, commandData],
            delete: [this.deleteMessage, this, commandData],
            poll: [counterPoll, this, commandData],
            cantada: [executeCantada, this, commandData],
            amongus: [executeAmongus, this, commandData],
            bet: [indexBet, this, commandData],
            removeReaction: [this.removeReaction, this, commandData],
            chat: [this.sendGlobalChatModel, this],
            giveaway: [giveaway, this, commandData],
            marry: [marry, this.interaction, commandData],
            clear: [this.clear, this, commandData],
            botinfo: [botinfoSaphire, this.interaction, commandData],
            mydata: [mydata.execute, this, commandData],
            sinfo: [pagesServerinfo, { interaction: this.interaction, customId: commandData, value: false }],
            connect: [connect, this, commandData],
            jkp: [checkJokempo, this, commandData] /* Jokempo */,
            twitch: [twitch, this, commandData],
            server: [serverRedirect, this.interaction, commandData],
            nsfw: [images, this.interaction, commandData],
            tcall: [tempcall, this.interaction, commandData],
            chest: [chest, this.interaction, commandData],
            spam: [redirectSpam, this.interaction, commandData?.src],
            commands: [commands, this.interaction, true],
            hangman: [buttonHangman, this.interaction, commandData],
            vip: [vipButtons, this.interaction, commandData],
            fasttype: [this.fasttype, this.interaction, commandData],
            "rmd": [reminderButtons, this.interaction, commandData]
        }[commandData.c]

        if (result) return result[0](...result?.slice(1))

        const byCustomId = {
            WordleGameInfo: [wordleGameInfoModal, this]
        }[this.customId]

        if (byCustomId) return byCustomId[0](byCustomId[1])

        const byThis = {
            newProof: ['newProof'],
            cancelVote: ['cancelVote'],
            copy: ['copyCripto']
        }[this.customId]

        if (byThis)
            return this[byThis]()

        return
    }

    fasttype(interaction, commandData) {
        const command = client.slashCommands.get("fasttype")

        if (!command)
            return interaction?.update({
                content: `${e.DenyX} | Comando não encontrado.`,
                components: []
            })
                .catch(() => interaction.reply({
                    content: `${e.DenyX} | Comando não encontrado.`,
                    components: []
                })
                    .catch(() => { }))

        return command.execute({ interaction }, commandData)
    }

    clear(interaction, customData) {
        const clearCommand = client.slashCommands.get(customData.c)

        if (!clearCommand)
            return interaction.update({
                content: `${e.Animated.SaphirePanic} | Epa epa epa, eu não achei o comando clear...`,
                components: []
            })

        return clearCommand.execute(interaction, customData)
    }

    async removeReaction({ interaction, customId, channel }, customData) {

        if (customId == 'cancel')
            return interaction.update({
                content: `${e.CheckV} | Comando cancelado com sucesso.`,
                embeds: [], components: []
            }).catch(() => { })

        const message = await channel.messages.fetch(customData.messageId || '0').catch(() => null)

        if (!message)
            return interaction.update({
                content: `${e.DenyX} | A mensagem selecionada não foi encontrada.`,
                embeds: [], components: []
            }).catch(() => { })

        return message.reactions.removeAll()
            .then(() => interaction.update({
                content: `${e.CheckV} | Todas as reações da [mensagem](${message.url}) foram removidas.`,
                embeds: [], components: []
            }).catch(() => { }))
            .catch(err => interaction.update({
                content: `${e.DenyX} | Não foi possível remover as reações da [mensagem](${message.url})\n${e.bug} | \`${err}\``,
                embeds: [], components: []
            }).catch(() => { }))

    }

    async sendGlobalChatModel({ interaction, customId }) {

        if (customId == "send")
            return interaction.showModal(Modals.globalChat)

        if (customId == "refresh") {
            interaction.message.delete().catch(() => { })
            const fields = await getMessagesAndFormat() || []

            if (!fields || !fields.length)
                return interaction.reply({
                    content: `${e.Deny} | Não tem nenhum mensagem global por enquanto.`,
                    components: [{
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "Enviar uma mensagem",
                                custom_id: JSON.stringify({ c: "chat", src: "send" }),
                                style: ButtonStyle.Primary
                            }
                        ]
                    }],
                    ephemeral: true
                })

            return interaction.reply({
                embeds: [
                    {
                        color: client.blue,
                        title: `📨 ${client.user.username}'s Global Chat`,
                        description: "Neste comando aparece apenas as últimas 9 mensagens globais.\nAs mensagens são atualizadas a cada 5 segundos.\nEste é um recurso beta.",
                        timestamp: new Date()
                    },
                    ...fields
                ],
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Enviar uma mensagem",
                            custom_id: JSON.stringify({ c: "chat", src: "send" }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            emoji: "🔄",
                            custom_id: JSON.stringify({ c: "chat", src: "refresh" }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }]
            })
                .then(() => refreshing())
                .catch(() => null)

            async function refreshing() {

                const interval = setInterval(async () => {
                    const fields = await getMessagesAndFormat() || []
                    if (!fields.length) return

                    return interaction.editReply({
                        embeds: [
                            {
                                color: client.blue,
                                title: `📨 ${client.user.username}'s Global Chat`,
                                description: "Neste comando aparece apenas as últimas 9 mensagens globais.\nAs mensagens são atualizadas a cada 5 segundos.\nEste é um recurso beta.",
                                timestamp: new Date()
                            },
                            ...fields
                        ]
                    })
                        .catch(() => clearInterval(interval))

                }, 5000)

                return
            }

            async function getMessagesAndFormat() {

                const data = await Database.Cache.Chat.get("Global") || []
                const messages = data.slice(-9)

                let fields = []

                if (messages) {

                    fields = messages.map(data => ({
                        color: client.blue,
                        author: {
                            name: `${data.userTag} [${data.userId}]`,
                            icon_url: data.userAvatar || null
                        },
                        description: data.content || "Nothing Here",
                        footer: {
                            text: `${data.guildName} - ${data.guildId}`,
                            icon_url: data.guildAvatar || null
                        }
                    }))

                    if (fields.length > 9)
                        fields.length = 9
                }

                return fields
            }
        }

        return interaction.reply({
            content: `${e.DenyX} | Nenhuma função encontrada para este botão.`,
            ephemeral: true
        })
    }

    deleteMessage({ message, user }, commandData) {

        if (user.id === commandData.userId) {
            message?.delete().catch(() => { })

            if (commandData.reminderId)
                socket?.send({ type: "removeReminder", id: commandData.reminderId })

            return
        }

        if (user.id !== message.interaction?.user?.id) return
        return message?.delete().catch(() => { })

    }

    /**
     * @param { ButtonInteraction } interaction 
     * @param {*} commandData 
     * @returns 
     */
    refeshPing(interaction, commandData) {

        if (![interaction.message.interaction?.user?.id, commandData?.userId].includes(interaction.user.id))
            return interaction.reply({
                content: `${e.Deny} | Hey! Só <@${commandData?.userId}> pode mandar um ping pra eu mandar um pong, ok? 🏓`,
                ephemeral: true
            })

        const pingCommand = client.slashCommands.get('ping')

        if (!pingCommand)
            return interaction.update({
                content: `${e.Deny} | Comando não encontrado`,
                components: []
            }).catch(() => { })

        return pingCommand.execute({ interaction, client, e }, commandData)
    }

    copyCripto() {

        const { embeds } = this.message
        const embed = embeds[0]?.data

        if (!embed)
            return this.interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            }).catch(() => { })

        const textCripto = embed.fields[1]?.value

        if (!textCripto)
            return this.interaction.update({
                content: `${e.Deny} | Texto criptografado não encontrado.`,
                components: []
            }).catch(() => { })

        return this.interaction.reply({ content: textCripto, ephemeral: true })

    }

    cancelVote() {
        const commandUserId = this.message.interaction.user.id
        if (commandUserId !== this.user.id) return this.interaction.deferUpdate().catch(() => { })
        return this.message.delete().catch(() => { })
    }

    async wordleGame(giveup) {

        const { message, user } = this.interaction

        if (this.customId === 'giveup-ephemeral') {

            const data = await this.Database.Cache.WordleGame.get('inGame')
            const game = data.find(value => value?.userId === user.id)

            if (!game)
                return message.edit({
                    content: `${this.emojis.Deny} | Jogo inexistente.`,
                    components: []
                }).catch(() => { })

            const deleted = await this.Database.Cache.WordleGame.delete(game.messageId)
            await this.Database.Cache.WordleGame.pull('inGame', data => data?.userId === user.id)

            if (deleted)
                return message.edit({
                    content: `${this.emojis.Check} | Jogo deletado com sucesso.`,
                    components: []
                }).catch(() => { })
            else
                return message.edit({
                    content: `${this.emojis.Info} | Jogo não encontrado no banco de dados.`,
                    components: []
                }).catch(() => { })
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

        if (!wordleGameData?.Players.includes(user.id)) return

        if (giveup) {

            const playersInGame = await this.Database.Cache.WordleGame.get('inGame')
            const game = playersInGame.find(data => data?.messageId === message.id)

            if (!game)
                return message.edit({
                    content: `${e.DenyX} | Jogo não encontrado.`,
                    embeds: [], components: []
                }).catch(() => { })

            if (game && game.userId !== this.user.id)
                return this.interaction.reply({
                    content: `${this.emojis.Deny} | Apenas <@${game.userId}> pode desistir desse jogo.`,
                    ephemeral: true
                })

            embed.description = `${this.emojis.Deny} | Poxa... Achei que você ia conseguir...\n${this.emojis.Info} | A palavra escondida era \`${wordleGameData.Word}\``
            embed.color = this.client.red
            await this.Database.Cache.WordleGame.delete(message.id)
            await this.Database.Cache.WordleGame.pull('inGame', data => data?.userId === user.id)
            return message.edit({ embeds: [embed], components: [] }).catch(() => { })
        }

        return this.interaction.showModal(this.modals.wordleGameNewTry(message.id, wordleGameData.Length))
    }

}