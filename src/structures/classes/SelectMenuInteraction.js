import { Database } from '../../classes/index.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import Base from './Base.js'

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

        const animesIndicationIds = ['animeSuggestionsGender', 'animeSuggestionsCategory', 'animeSuggestionsMatchPublic']

        if (animesIndicationIds.includes(this.customId))
            return this.animeSetSuggestions(this)

        switch (this.customId) {
            case 'vocePrefere': this.vocePrefere(this); break;
            case 'animeSuggestions': this.animeSuggestions(this); break;
        }

        return
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
            animeSuggestionsGender: 1,
            animeSuggestionsCategory: 2,
            animeSuggestionsMatchPublic: 3
        }[customId]

        if (isNaN(field))
            return await interaction.update({
                content: `${e.Deny} | Valores não encontrados.`,
                components: [],
                embeds: []
            }).catch(() => { })

        embed.fields[field].value = values.map(value => `\`${value}\``).join(', ')

        if (
            !embed.fields[1].value.includes(e.Loading)
            && !embed.fields[2].value.includes(e.Loading)
            && !embed.fields[3].value.includes(e.Loading)
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
            const category = embed.fields[2].value.replace(/`/g, '').split(', ')
            const gender = embed.fields[1].value.replace(/`/g, '').split(', ')
            const targetPublic = embed.fields[3].value.replace(/`/g, '').split(', ')
            const authorId = embed.footer.text

            if (animesIndications.find(anime => anime.name?.toLowerCase() === name?.toLowerCase())) {
                await interaction.message.delete().catch(() => { })
                return await interaction.reply({
                    content: `${e.Deny} | O anime \`${name}\` já existe no banco de dados.`,
                    ephemeral: true
                })
            }

            return new Database.Indications({ name, category, gender, targetPublic, authorId })
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

    }
}