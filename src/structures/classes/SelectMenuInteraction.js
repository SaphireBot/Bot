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
    }

    filterAndChooseFunction() {

        switch (this.customId) {
            case 'vocePrefere': this.vocePrefere(this); break;
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
}