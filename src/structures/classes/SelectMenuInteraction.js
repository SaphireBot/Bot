import { Database, SaphireClient as client } from '../../classes/index.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import { Permissions, PermissionsTranslate } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'
import searchAnime from '../commands/functions/anime/search.anime.js'
import genderProfile from '../commands/slashCommands/perfil/perfil/gender.profile.js'
import signProfile from '../commands/slashCommands/perfil/perfil/sign.profile.js'
import Base from './Base.js'
import likePerfil from './buttons/perfil/like.perfil.js'
import deathAmongus from './selectmenu/amongus/death.amongus.js'
import configAnunciar from './selectmenu/announce/config.anunciar.js'
import logsChange from './selectmenu/logsCommand/index.logs.js'
import refundRifa from './selectmenu/rifa/refund.rifa.js'
import translateSearch from './selectmenu/search/translate.search.js'

export default class SelectMenuInteraction extends Base {
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
            gender: 'chooseGender',
            signEphemeral: 'chooseSign',
            genderEphemeral: 'chooseGender'
        }[this.customId]

        if (this[result])
            return this[result](this)

        if (this.value.startsWith('{')) {

            this.customId = JSON.parse(this.value)

            const byValues = {
                chooseSign: 'sendSelectMenuSign',
                chooseGender: 'sendSelectMenuGender',
                refreshProfile: 'refreshProfile',
                like: 'newLike',
                editProfile: 'editProfile'
            }[this.customId?.c]

            if (byValues)
                return this[byValues](this)
        }

        if (!this.customId?.startsWith('{')) return
        this.customId = JSON.parse(this?.customId)

        const result2 = {
            anunciar: configAnunciar,
            amongus: deathAmongus
        }[this.customId?.c]

        if (result2)
            return result2(this)
    }

    async editProfile({ Database, user, interaction, modals }) {

        const data = await Database.User.findOne({ id: user.id }, 'Perfil')

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
        const modal = modals.editProfileModal(title, job, niver, status)

        return await interaction.showModal(modal)
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

        const profileCommand = client.slashCommands.find(cmd => cmd.name === 'perfil')

        if (!profileCommand)
            return await interaction.update({
                content: `${e.Deny} | Comando n??o encontrado.`,
                components: []
            }).catch(() => { })

        const guildData = await Database.Guild.findOne({ id: guild.id })
        const Moeda = guildData?.Moeda || `${e.Coin} Safiras`

        const clientData = await Database.Client.findOne({ id: client.user.id })

        return await profileCommand.execute({
            interaction: interaction,
            client: client,
            emojis: e,
            Database: Database,
            Moeda: Moeda,
            clientData: clientData,
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
                content: `${e.Check} | Eu n??o tenho a permiss??o **\`${PermissionsTranslate.ManageChannels}\`**. N??o posso continuar com o comando.`,
                components: []
            })

        if (!member.memberPermissions(Permissions.ManageChannels))
            return await interaction.update({
                content: `${e.Check} | Voc?? n??o tem a permiss??o **\`${PermissionsTranslate.ManageChannels}\`**. Comando encerrado, ok?`,
                components: []
            })

        const { pId: parentId, cId: channelId } = JSON.parse(values[0])

        const channel = guild.channels.cache.get(channelId)
        const parent = guild.channels.cache.get(parentId)

        if (!channel)
            return await interaction.update({
                content: `${e.Deny} | Canal n??o encontrado.`,
                components: []
            }).catch(() => { })

        if (!parent)
            return await interaction.update({
                content: `${e.Deny} | Categoria n??o encontrada.`,
                components: []
            }).catch(() => { })

        const changed = await channel.setParent(parent.id, {
            lockPermissions: true,
            reason: `${user.tag} alterou a categoria.`
        }).catch(err => err.code)

        if (changed.constructor === Number)
            return await interaction.update({
                content: `${e.Deny} | N??o poss??vel alterar a categoria do canal ${channel}. \`${changed}\``,
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
                    content: `${e.Deny} | Embed n??o encontrada.`,
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
                    content: `${e.Deny} | Embed n??o encontrada.`,
                    components: []
                })

            const authorId = embed.footer.text
            const questionOne = embed.fields[3]?.value || embed.fields[1].value
            const questionTwo = embed.fields[4]?.value || embed.fields[2].value
            const edited = embed.fields[3] ? true : false

            return Database.Rather.create({
                id: questionId,
                authorId: authorId,
                optionOne: { question: questionOne },
                optionTwo: { question: questionTwo },
                edited: edited
            }, async function (error) {

                if (error)
                    return await interaction.reply({
                        content: `${e.Deny} | N??o foi poss??vel salvar esta sugest??o.`,
                        ephemeral: true
                    })

                await message.delete().catch(() => { })
                return await interaction.reply({
                    content: `${e.Check} | Sujest??o de pergunta criada com sucesso.`,
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
            content: `${e.Check} | Voc?? alterou o signo para **${sign}**.`,
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
            content: `${e.Check} | Voc?? alterou o sexo para **${gender}**.`,
            components: []
        })
    }

    async animeSetSuggestions({ interaction, values, message, e, customId, user }) {

        const { embeds } = message
        const embed = embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed n??o encontrada.`,
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
                content: `${e.Deny} | Valores n??o encontrados.`,
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

    async animeSuggestions({ interaction, value, message, e, Database }) {

        if (value === 'edit') {

            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed n??o encontrada.`,
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
            const guildData = await Database.Guild.findOne({ id: guildId })
            const webhookUrl = guildData?.LogSystem?.webhookUrl
            if (!webhookUrl) return

            return client.sendWebhook(
                webhookUrl,
                {
                    username: "Global System Notification | Anime Indications",
                    avatarURL: process.env.WEBHOOK_GSN_AVATAR,
                    content: `${e.Notification} | <@${authorId}> \`${authorId}\`\n${e.Deny} | O anime que voc?? indicou **N??O** foi aceito. -> **${name}**`
                }
            )


        }

        if (value === 'accept') {

            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed n??o encontrada.`,
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
                    content: `${e.Deny} | O anime \`${name}\` j?? existe no banco de dados.`,
                    ephemeral: true
                })
            }

            const guildData = await Database.Guild.findOne({ id: guildId })
            const webhookUrl = guildData?.LogSystem?.webhookUrl

            if (webhookUrl) sendWebhookMessage()

            return new Database.Indications({ name, category: [...category, ...category2], gender, targetPublic, authorId })
                .save(async function (err) {

                    if (err)
                        return await interaction.update({
                            content: `${e.Deny} | Houve um erro ao salvar esta sugest??o.`,
                            components: []
                        })

                    interaction.message.delete().catch(() => { })
                    return await interaction.reply({
                        content: `${e.Check} | O anime \`${name}\` foi salvo com sucesso.`,
                        ephemeral: true
                    })

                })

            async function sendWebhookMessage() {

                return client.sendWebhook(
                    webhookUrl,
                    {
                        username: "Global System Notification | Anime Indications",
                        avatarURL: process.env.WEBHOOK_GSN_AVATAR,
                        content: `${e.Notification} | <@${authorId}> \`${authorId}\`\n${e.Check} | O anime que voc?? indicou foi aceito. -> **${name}**\n???? | Voc?? pode v??-lo usando \`/anime indications search: ${name}\``
                    }
                )

            }

        }

        if (value === 'info') {

            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed n??o encontrada.`,
                    components: []
                }).catch(() => { })

            const animeName = embed.fields[0]?.value

            if (!animeName)
                return await interaction.update({
                    content: `${e.Deny} | Nome n??o encontrado.`,
                    components: []
                }).catch(() => { })

            return await searchAnime(interaction, animeName)

        }
    }
}