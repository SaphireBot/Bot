import { Database } from '../../classes/index.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import { Permissions, PermissionsTranslate } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'
import searchAnime from '../commands/functions/anime/search.anime.js'
import Base from './Base.js'
import translateSearch from './selectmenu/translate.search.js'
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
            changeCategory2: 'editCategoryChannel'
        }[this.customId]

        if (!result) return

        return this[result](this)
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
            reason: `${user.tag} alterou a categoria.`
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

            return Database.Rather.create({
                id: questionId,
                authorId: authorId,
                optionOne: { question: questionOne },
                optionTwo: { question: questionTwo },
                edited: edited
            }, async function (error) {

                if (error)
                    return await interaction.reply({
                        content: `${e.Deny} | Não foi possível salvar esta sugestão.`,
                        ephemeral: true
                    })

                await message.delete().catch(() => { })
                return await interaction.reply({
                    content: `${e.Check} | Sujestão de pergunta criada com sucesso.`,
                    ephemeral: true
                })

            })

        }

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

    async animeSuggestions({ interaction, value, message, e, Database }) {

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

        if (value === 'deny') return await message.delete().catch(() => { })

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
            const targetPublic = embed.fields[4].value.replace(/`/g, '').split(', ')
            const authorId = embed.footer.text

            if (animesIndications.find(anime => anime.name?.toLowerCase() === name?.toLowerCase())) {
                await interaction.message.delete().catch(() => { })
                return await interaction.reply({
                    content: `${e.Deny} | O anime \`${name}\` já existe no banco de dados.`,
                    ephemeral: true
                })
            }

            return new Database.Indications({ name, category: [...category, ...category2], gender, targetPublic, authorId })
                .save(async function (err) {

                    if (err)
                        return await interaction.update({
                            content: `${e.Deny} | Houve um erro ao salvar esta sugestão.`,
                            components: []
                        })

                    interaction.message.delete().catch(() => { })
                    return await interaction.reply({
                        content: `${e.Check} | O anime \`${name}\` foi salvo com sucesso.`,
                        ephemeral: true
                    })

                })

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