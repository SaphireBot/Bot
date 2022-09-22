import { Database } from '../../classes/index.js'
import { CodeGenerator } from '../../functions/plugins/plugins.js'
import Base from './Base.js'
import fs from 'fs'

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
    }

    filterAndChooseFunction() {

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

    async animeSuggestions({ interaction, value, message, e, Database }) {

        if (value === 'edit') {

            const { embeds } = message
            const embed = embeds[0]?.data

            if (!embed)
                return await interaction.update({
                    content: `${e.Deny} | Embed não encontrada.`,
                    components: []
                })

            const name = embed.fields[3]?.value || embed.fields[1].value
            const category = embed.fields[4]?.value || embed.fields[2].value

            return await interaction.showModal(this.modals.indicateAnime('animeIndicationsEdit', name, category))
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

            const authorId = embed.footer.text
            const name = embed.fields[3]?.value || embed.fields[1].value
            const category = embed.fields[4]?.value || embed.fields[2].value
            const animesIndications = Database.animeIndications || []

            if (animesIndications.find(anime => anime.name?.toLowerCase() === name?.toLowerCase() || anime.name?.toLowerCase().includes(name?.toLowerCase())))
                return await interaction.update({
                    content: `${e.Deny} | Este anime já existe no banco de dados - \`${name}\``,
                    components: [],
                    embeds: []
                })

            animesIndications.push({ name, category, authorId })

            return fs.writeFile(
                './JSON/indications.json',
                JSON.stringify(animesIndications, null, 4),
                async function (err) {

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

                }
            )

        }

    }
}