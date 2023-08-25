import { Database, SaphireClient as client } from '../../classes/index.js'
import { Permissions, PermissionsTranslate } from '../../util/Constants.js'
import { StringSelectMenuInteraction } from 'discord.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import { Emojis as e } from '../../util/util.js'
// import managerReminder from '../../functions/update/reminder/manager.reminder.js'
import editReminder from '../../functions/update/reminder/src/edit.reminder.js'
import moveReminder from '../../functions/update/reminder/src/move.reminder.js'
import removeReminder from '../../functions/update/reminder/src/remove.reminder.js'
import searchAnime from '../commands/functions/anime/search.anime.js'
import deleteGiveaway from '../commands/functions/giveaway/delete.giveaway.js'
import finishGiveaway from '../commands/functions/giveaway/finish.giveaway.js'
import rerollGiveaway from '../commands/functions/giveaway/reroll.giveaway.js'
import resetGiveaway from '../commands/functions/giveaway/reset.giveaway.js'
import genderProfile from '../commands/slashCommands/perfil/perfil/gender.profile.js'
import signProfile from '../commands/slashCommands/perfil/perfil/sign.profile.js'
import Base from './Base.js'
import likePerfil from './buttons/perfil/like.perfil.js'
import deathAmongus from './selectmenu/amongus/death.amongus.js'
import configAnunciar from './selectmenu/announce/config.anunciar.js'
import logsChange from './selectmenu/logsCommand/index.logs.js'
import refundRifa from './selectmenu/rifa/refund.rifa.js'
import translateSearch from './selectmenu/search/translate.search.js'
import checkerQuiz from './buttons/quiz/checker.quiz.js'
import pagesServerinfo from '../commands/functions/serverinfo/pages.serverinfo.js'
import redirectJokempo from './buttons/jokempo/redirect.jokempo.js'
import infoSpam from './selectmenu/spam/info.spam.js'
import redirectSpam from './selectmenu/spam/redirect.spam.js'
import unsetImuneChannels from './selectmenu/spam/unsetImuneChannels.spam.js'
import setImuneRoles from './selectmenu/spam/setImuneRoles.spam.js'
import unsetImuneRoles from './selectmenu/spam/unsetImuneRoles.spam.js'
import messagesAmount from './selectmenu/spam/messagesAmount.spam.js'
import messagesSeconds from './selectmenu/spam/messagesSeconds.spam.js'
import setImuneChannels from './selectmenu/spam/setImuneChannels.spam.js'
import minday from './selectmenu/minday/interaction.minday.js'
import indexBet from './buttons/bet/index.bet.js'
import { socket } from '../../websocket/websocket.js'

export default class SelectMenuInteraction extends Base {
    /**
     * @param { StringSelectMenuInteraction } interaction 
     */
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.e = this.emojis
        this.customId = interaction.customId
        this.values = interaction.values
        this.message = interaction.message
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.value = this.values[0]
        this.values = this.values
    }

    filterAndChooseFunction() {

        if (['custom', 'custom1'].includes(this.customId)) return

        const animesIndicationIds = ['animeSuggestionsGender', 'animeSuggestionsTags', 'animeSuggestionsTags2', 'animeSuggestionsMatchPublic']
        if (animesIndicationIds.includes(this.customId))
            return this.animeSetSuggestions(this)

        const result = {
            vocePrefere: 'vocePrefere',
            animeSuggestions: 'animeSuggestions',
            animeChoosen: 'animeChoosen',
            mangaChoosen: 'mangaChoosen',
            changeCategory: 'editCategoryChannel',
            changeCategory2: 'editCategoryChannel',
            rifa: 'refundFunction',
            logs: 'logsFunction',
            sign: 'chooseSign',
            quizOptions: 'quizOptions',
            quizOptionsData: 'quizOptions',
            gender: 'chooseGender',
            signEphemeral: 'chooseSign',
            genderEphemeral: 'chooseGender',
            reminder: 'reminder',
            jkp: 'jokempo',
            selectRoles: 'selectRoles',
            spam: 'spam'
        }[this.customId]

        if (this[result])
            return this[result](this)

        if (this.value?.startsWith('{')) {

            this.customId = JSON.parse(this.value)

            const byValues = {
                chooseSign: 'sendSelectMenuSign',
                chooseGender: 'sendSelectMenuGender',
                refreshProfile: 'refreshProfile',
                like: 'newLike',
                editProfile: 'editProfile',
                giveaway: 'giveaway',
                'delete': 'deleteMessage'
            }[this.customId?.c]

            if (byValues)
                return this[byValues](this)
        }

        if (typeof this.customId === 'string' && !this.customId?.startsWith('{')) return
        this.customId = JSON.parse(this?.customId)

        if (this.customId?.c == 'bet') return indexBet(this, this.customId)
        if (this.customId?.c == 'minday')
            return minday(this.interaction, this.value, this.customId?.src)

        if (this.customId?.c == 'spam') {

            if (['messagesAmount', 'messagesSeconds'].includes(this.customId?.src))
                return { messagesAmount, messagesSeconds }[this.customId?.src](this.interaction, this.value)

            const execute = {
                unsetImuneChannels,
                unsetImuneRoles,
                setImuneRoles,
                setImuneChannels
            }[this.customId?.src]

            return execute(this.interaction, this.values)
        }

        const result2 = {
            anunciar: configAnunciar,
            amongus: deathAmongus,
            serverinfo: pagesServerinfo,
            twitch: 'twitchClip'
        }[this.customId?.c]

        if (typeof result2 == 'string')
            return this[result2](this)

        if (result2)
            return result2(this)
    }

    async spam({ value, interaction }) {

        if (value == 'info')
            return infoSpam(interaction)

        return redirectSpam(interaction, value)
    }

    async twitchClip({ value, interaction, message }) {

        message.edit({ components: [message.components[0].toJSON()] }).catch(() => { })
        await interaction.reply({ content: `${e.Loading} | Carregando clip...`, ephemeral: true })
        const clipRequest = await client.TwitchFetcher(`https://api.twitch.tv/helix/clips?id=${value}`)

        if (clipRequest == 'TIMEOUT')
            return interaction.editReply({
                content: `${e.Animated.SaphirePanic} | Aaaaah, o sistema da Twitch está pegando FOOOOGO 🔥\n🧑‍🚒 | Fica tranquilo, que tudo está normal em menos de 1 minuto. ||Rate limit é uma coisinha chata||`
            }).catch(() => { })

        if (!clipRequest || !clipRequest.length)
            return interaction.editReply({ content: `${e.Animated.SaphireCry} | NOOO, eu não achei o clip!!` })

        const clip = clipRequest[0]

        if (!clipRequest || !clipRequest.length)
            return interaction.editReply({ content: `${e.Animated.SaphireCry} | NOOO, eu não achei o clip!!` })

        return interaction.editReply({
            // content: `🎬 | Aqui está o clip de **${clip.broadcaster_name}** \`${clip.broadcaster_id}\` criado por **${clip.creator_name}** \`${clip.creator_id}\`\n${e.Info} | Este video foi visto **${(clip.view_count || 0).currency()}** vezes e tem **${clip.duration} segundos**.\n${e.twitch} | [${clip.title.replace(/#|\[|\]|\p{S}|\d+/gu, "").trim()}](${clip.url})`,
            content: `🎬 | Aqui está o clip de **${clip.broadcaster_name}** \`${clip.broadcaster_id}\` criado por **${clip.creator_name}** \`${clip.creator_id}\`\n${e.Info} | Este video foi visto **${(clip.view_count || 0).currency()}** vezes e tem **${clip.duration} segundos**.\n${e.twitch} | [Assistir Clip na Twitch](${clip.url})`,
            fetchReply: true
        })
            .catch(err => interaction.editReply({
                content: `${e.Animated.SaphirePanic} | WOOOW! Algo deu muito errado.\n${e.bug} | \`${err}\``
            }).catch(() => { }))
    }

    jokempo() {
        return redirectJokempo(this, JSON.parse(this.value))
    }

    async selectRoles() {
        const { member } = this.interaction
        const toRemove = this.values.filter(roleId => member.roles.cache.has(roleId)) || []
        const toAdd = this.values.filter(roleId => !member.roles.cache.has(roleId)) || []
        if (toRemove.length) await member.roles.remove(toRemove).catch(() => { })
        if (toAdd.length) await member.roles.add(toAdd).catch(() => { })
        return this.interaction.reply({ content: `${e.Check} | Prontinho, cargos configurados com sucesso.`, ephemeral: true })
    }

    async quizOptions() {
        if (!['reviewReports', 'reviewCategory', 'back', 'reviewQuestion', 'play'].includes(this.value)) await this.interaction.message.edit({ components: this.interaction.message.components }).catch(() => { })
        return checkerQuiz(this.interaction, { src: this.value })
    }

    async deleteMessage({ message, user }) {
        if (user.id !== message.interaction?.user?.id) return
        return await message.delete()?.catch(() => { })
    }

    async giveaway({ interaction, message, value, user, guild }) {

        if (user.id !== message.embeds[0]?.data?.footer?.text) return

        const data = JSON.parse(value || {})
        const src = data?.src

        if (!data || !src)
            return await interaction.update({
                components: `${e.Deny} | Algo de errado não está certo por aqui.`,
                components: [], embeds: []
            }).catch(() => { })

        if (src == 'finish') return finishGiveaway(interaction, data.gwId)

        const execute = {
            'delete': deleteGiveaway,
            reset: resetGiveaway,
            reroll: rerollGiveaway
        }[src]

        if (!execute)
            return await interaction.reply({
                content: `${e.saphireDesespero} | NENHUMA COISA FOI ACHADAAA. Entra no meu servidor e fala pro meu criador, pelo amor de Deus!! \`#15482615\``
            })

        const guildData = await Database.getGuild(guild.id) || {}
        await execute(interaction, guildData, data.gwId)

        if (['delete', 'reset', 'finish'].includes(src))
            await message.delete()?.catch(() => { })

        return
    }

    async reminder({ interaction, value, user }) {

        const data = JSON.parse(value)
        const reminderData = await socket?.timeout(1000)?.emitWithAck("getReminder", data?.reminderId).catch(() => null)

        if (!reminderData)
            return interaction.update({
                content: `${e.Deny} | Lembrete não encontrado.`,
                embeds: [], components: []
            }).catch(() => { })

        if (user.id !== reminderData?.userId) return

        if (data.c === 'edit')
            return editReminder(interaction, data.reminderId)

        if (data.c === 'move')
            return moveReminder(interaction, data.reminderId)

        if (data.c === 'delete') {
            return removeReminder(interaction, data.reminderId)
        }

        return interaction.reply({
            content: `${e.Deny} | Sub-comando não encontrado.`,
            ephemeral: true
        })
    }

    async editProfile({ user, interaction, modals }) {

        const data = await Database.getUser(user.id)

        if (!data) {
            await Database.registerUser(this.user)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | Por favor, tente novamente.`,
                ephemeral: true
            })
        }

        const title = data?.Perfil?.Titulo || null
        const job = data?.Perfil?.Trabalho || null
        const niver = data?.Perfil?.Aniversario || null
        const status = data?.Perfil?.Status || null

        return await interaction.showModal(
            modals.editProfileModal(title, job, niver, status)
        )
    }

    newLike({ interaction }) {
        return likePerfil(interaction, this.customId.src)
    }

    sendSelectMenuSign({ interaction }) {
        return signProfile(interaction, true)
    }

    sendSelectMenuGender({ interaction }) {
        return genderProfile(interaction, true)
    }

    async refreshProfile({ interaction, user, message, client, Database, guild }) {

        if (user.id !== message.interaction.user.id) return

        const profileCommand = client.slashCommands.find(cmd => cmd.name === 'profile')

        if (!profileCommand)
            return await interaction.update({
                content: `${e.Deny} | Comando não encontrado.`,
                components: []
            }).catch(() => { })

        const guildData = await Database.getGuild(guild.id)
        const Moeda = guildData?.Moeda || `${e.Coin} Safiras`

        const clientData = await Database.Client.findOne({ id: client.user.id })

        return await profileCommand.execute({
            interaction,
            client,
            Database,
            Moeda,
            clientData,
            emojis: e,
            refresh: true
        })
    }

    logsFunction() {
        return logsChange(this)
    }

    refundFunction() {
        return refundRifa(this)
    }

    async editCategoryChannel({ interaction }) {

        const { guild, member, user, values, message } = interaction

        if (user.id !== message?.interaction.user.id) return

        if (!guild.clientHasPermission(Permissions.ManageChannels))
            return await interaction.update({
                content: `${e.Check} | Eu não tenho a permissão **\`${PermissionsTranslate.ManageChannels}\`**. Não posso continuar com o comando.`,
                components: []
            })

        if (!member.memberPermissions(Permissions.ManageChannels))
            return await interaction.update({
                content: `${e.Check} | Você não tem a permissão **\`${PermissionsTranslate.ManageChannels}\`**. Comando encerrado, ok?`,
                components: []
            })

        const { pId: parentId, cId: channelId } = JSON.parse(values[0])

        const channel = guild.channels.cache.get(channelId)
        const parent = guild.channels.cache.get(parentId)

        if (!channel)
            return await interaction.update({
                content: `${e.Deny} | Canal não encontrado.`,
                components: []
            }).catch(() => { })

        if (!parent)
            return await interaction.update({
                content: `${e.Deny} | Categoria não encontrada.`,
                components: []
            }).catch(() => { })

        const changed = await channel.setParent(parent.id, {
            lockPermissions: true,
            reason: `${user.username} alterou a categoria.`
        }).catch(err => err.code)

        if (changed.constructor === Number)
            return await interaction.update({
                content: `${e.Deny} | Não possível alterar a categoria do canal ${channel}. \`${changed}\``,
                components: []
            }).catch(() => { })

        return await interaction.update({
            content: `${e.Check} | O canal ${channel} foi movido para a categoria **${parent.name?.toUpperCase()}**.`,
            components: []
        }).catch(() => { })
    }

    async animeChoosen() {
        return translateSearch(this)
    }

    async mangaChoosen() {
        return translateSearch(this)
    }

    async vocePrefere({ interaction, value, message, e }) {

        if (value === 'edit') {

            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed não encontrada.`,
                    components: []
                })

            const questionOne = embed.fields[3]?.value || embed.fields[1].value
            const questionTwo = embed.fields[4]?.value || embed.fields[2].value

            return await interaction.showModal(this.modals.vocePrefere(questionOne, questionTwo, 'ratherEdit'))
        }

        if (value === 'deny') return await message.delete().catch(() => { })

        if (value === 'accept') {

            const questionId = CodeGenerator(10)
            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed não encontrada.`,
                    components: []
                })

            const authorId = embed.footer.text
            const questionOne = embed.fields[3]?.value || embed.fields[1].value
            const questionTwo = embed.fields[4]?.value || embed.fields[2].value
            const edited = embed.fields[3] ? true : false

            new Database.Rather({
                id: questionId,
                authorId: authorId,
                optionOne: { question: questionOne },
                optionTwo: { question: questionTwo },
                edited: edited
            })
                .save()
                .then(async () => {
                    await message.delete().catch(() => { })
                    return await interaction.reply({
                        content: `${e.Check} | Sugestão de pergunta criada com sucesso.`,
                        ephemeral: true
                    })
                })
                .catch(async err => {
                    await interaction.reply({
                        content: `${e.Deny} | Não foi possível salvar esta sugestão.\n${e.bug} | \`${err}\``,
                        ephemeral: true
                    })
                })

        }

    }

    async chooseSign({ interaction, values, user, message }) {

        if (this.customId !== 'signEphemeral' && user.id !== message?.interaction?.user?.id) return
        const sign = values[0]

        await Database.User.updateOne(
            { id: user.id },
            { $set: { "Perfil.Signo": sign } },
            { upsert: true }
        )

        return await interaction.update({
            content: `${e.Check} | Você alterou o signo para **${sign}**.`,
            components: []
        })
    }

    async chooseGender({ interaction, values, user, message }) {

        if (this.customId !== 'genderEphemeral' && user.id !== message?.interaction?.user?.id) return
        const gender = values[0]

        await Database.User.updateOne(
            { id: user.id },
            { $set: { "Perfil.Sexo": gender } },
            { upsert: true }
        )

        return await interaction.update({
            content: `${e.Check} | Você alterou o sexo para **${gender}**.`,
            components: []
        })
    }

    async animeSetSuggestions({ interaction, values, message, e, customId, user }) {

        const { embeds } = message
        const embed = embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            }).catch(() => { })

        if (user.id !== embed.footer.text) return

        const field = {
            animeSuggestionName: 0,
            animeSuggestionsGender: 1,
            animeSuggestionsTags: 2,
            animeSuggestionsTags2: 3,
            animeSuggestionsMatchPublic: 4
        }[customId]

        if (isNaN(field))
            return await interaction.update({
                content: `${e.Deny} | Valores não encontrados.`,
                components: [],
                embeds: []
            }).catch(() => { })

        embed.fields[field].value = values.map(value => `\`${value}\``).join(', ').limit('MessageEmbedFieldValue')

        if (
            !embed.fields[1].value.includes(e.Loading)
            && (!embed.fields[2].value.includes(e.Loading) || !embed.fields[3].value.includes(e.Loading))
            && !embed.fields[4].value.includes(e.Loading)
        ) {
            const components = message.components
            components[0].components[0].data.disabled = false
            return await interaction.update({ embeds: [embed], components }).catch(() => { })
        }

        return await interaction.update({ embeds: [embed] }).catch(() => { })
    }

    async animeSuggestions({ interaction, value, message }) {

        if (value === 'edit') {

            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed não encontrada.`,
                    components: []
                })

            const name = embed.fields[0].value

            return await interaction.showModal(this.modals.indicateAnime('animeIndicationsEdit', name))
        }

        if (value === 'deny') {

            await message.delete().catch(() => { })

            const { embeds } = message
            const embed = embeds[0]?.data
            if (!embed) return

            const name = embed.fields[0].value
            const guildId = embed.fields[embed.fields.length - 1]?.value
            const authorId = embed.footer.text
            const guildData = await Database.getGuild(guildId)
            const webhookUrl = guildData?.LogSystem?.webhookUrl
            if (!webhookUrl) return

            return client.sendWebhook(
                webhookUrl,
                {
                    username: "Global System Notification | Anime Indications",
                    avatarURL: process.env.WEBHOOK_GSN_AVATAR,
                    content: `${e.Notification} | <@${authorId}> \`${authorId}\`\n${e.Deny} | O anime que você indicou **NÃO** foi aceito. -> **${name}**`
                }
            )

        }

        if (value === 'accept') {

            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed não encontrada.`,
                    components: []
                })

            const animesIndications = await Database.animeIndications() || []
            const name = embed.fields[0].value
            const gender = embed.fields[1].value.replace(/`/g, '').split(', ')
            const category = embed.fields[2].value.replace(/`/g, '').split(', ')
            const category2 = embed.fields[3]?.value.replace(/`/g, '').split(', ')
            const targetPublic = embed.fields[4]?.value.replace(/`/g, '').split(', ')
            const guildId = embed.fields[embed.fields.length - 1]?.value
            const authorId = embed.footer.text

            if (animesIndications.find(anime => anime.name?.toLowerCase() === name?.toLowerCase())) {
                await interaction.message.delete().catch(() => { })
                return await interaction.reply({
                    content: `${e.Deny} | O anime \`${name}\` já existe no banco de dados.`,
                    ephemeral: true
                })
            }

            const guildData = await Database.getGuild(guildId)
            const webhookUrl = guildData?.LogSystem?.webhookUrl

            if (webhookUrl) sendWebhookMessage()

            return await new Database.Indications({ name, category: [...category, ...category2], gender, targetPublic, authorId })
                .save()
                .then(() => {
                    interaction.message.delete().catch(() => { })
                    return interaction.reply({
                        content: `${e.Check} | O anime \`${name}\` foi salvo com sucesso.`,
                        ephemeral: true
                    })
                })
                .catch(err => {
                    return interaction.reply({
                        content: `${e.Animated.SaphirePanic} | Deu erro aqui!!!\n${e.bug} | \`${err}\``,
                        ephemeral: true
                    })
                })

            async function sendWebhookMessage() {

                return client.sendWebhook(
                    webhookUrl,
                    {
                        username: "Global System Notification | Anime Indications",
                        avatarURL: process.env.WEBHOOK_GSN_AVATAR,
                        content: `${e.Notification} | <@${authorId}> \`${authorId}\`\n${e.Check} | O anime que você indicou foi aceito. -> **${name}**\n🔎 | Você pode vê-lo usando \`/anime indications search: ${name}\``
                    }
                )

            }

        }

        if (value === 'info') {

            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed não encontrada.`,
                    components: []
                }).catch(() => { })

            const animeName = embed.fields[0]?.value

            if (!animeName)
                return await interaction.update({
                    content: `${e.Deny} | Nome não encontrado.`,
                    components: []
                }).catch(() => { })

            return await searchAnime(interaction, animeName)

        }
    }
}