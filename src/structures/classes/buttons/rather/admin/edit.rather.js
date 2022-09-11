import { Database } from "../../../../../classes/index.js"

export default async ({ interaction, customId, message, modals, client, emojis: e }) => {

    if (customId === 'cancel')
        return await interaction.update({
            content: `${e.Deny} | Comando cancelado.`,
            embeds: [],
            components: []
        }).catch(() => { })

    const { embeds } = message
    const embed = embeds[0]?.data

    if (customId === 'edit') {

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            })

        const questionOne = embed.fields[3]?.value || embed.fields[0].value
        const questionTwo = embed.fields[4]?.value || embed.fields[1].value

        return await interaction.showModal(modals.adminEditVocePrefere(questionOne, questionTwo, embed.footer.text))
    }

    if (customId === 'confirm') {

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            })

        const questionId = embed.footer.text
        const questionOne = embed.fields[3]?.value || embed.fields[0].value
        const questionTwo = embed.fields[4]?.value || embed.fields[1].value

        return Database.Rather.findOneAndUpdate(
            { id: questionId },
            {
                $set: {
                    ['optionOne.question']: questionOne,
                    ['optionTwo.question']: questionTwo,
                    edited: true
                }
            }, { new: true }
        )
            .then(async question => {

                return await interaction.update({
                    embeds: [{
                        color: client.green,
                        title: '✍ Questão editada com sucesso.',
                        description: `Question ID: \`${question.id}\`\nQuestão respondida \`${question.optionOne.users.length || 0 + question.optionTwo.users.length || 0}\` vezes`,
                        fields: [
                            {
                                name: '🔵 Opção 1',
                                value: `~~${questionOne}~~`
                            },
                            {
                                name: '🟢 Opção 2',
                                value: `~~${questionTwo}~~`
                            },
                            {
                                name: '👤 Autor',
                                value: `${client.users.resolve(question.authorId)?.tag || 'Not Found'} - \`${question.authorId}\``
                            },
                            {
                                name: `🔵 Opção 1 - ${e.Check}`,
                                value: question.optionOne.question
                            },
                            {
                                name: `🟢 Opção 2 - ${e.Check}`,
                                value: question.optionTwo.question
                            }
                        ],
                        footer: { text: `${question.id} - Editado` }
                    }],
                    components: []
                }).catch(() => { })
            })
            .catch(async err => {
                console.log(err)
                return await interaction.update({
                    content: `${e.Deny} | Não foi possível editar está questão.`,
                    embeds: [],
                    components: []
                }).catch(() => { })
            })

    }
}